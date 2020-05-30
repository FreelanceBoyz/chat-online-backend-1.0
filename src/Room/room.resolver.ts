import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { Query, Resolver, Mutation, Args, Context } from '@nestjs/graphql';

import { RoomService } from 'Room/room.service';
import { Room } from 'Room/models/room.models';
import { RoomsConnection } from 'Room/graphql-types/room.graphql';
import { BasicResponse } from 'common/common-models';
import { GqlAuthGuard } from 'Graphql/graphql.guard';
import { UserService } from 'User/user.service';
import { Types } from 'mongoose';

@Resolver(() => Room)
export class RoomResolvers {
  constructor(private readonly roomService: RoomService, private readonly userService: UserService) {}

  @UseGuards(GqlAuthGuard)
  @Query(_returns => RoomsConnection)
  async RoomGraphGetAllRoom(@Context() context, @Args('first') count: number, @Args('after') cursor: string ) {
    try {
      const { user: { _id } } = context.req;
      const currentUser = await this.userService.findUserById(_id, { rooms: 1 });
      let rooms = currentUser.rooms as [any];
      let indexOfRoom = -1;
      if (cursor) {
        const cursorRoom = rooms.find((room) => room.toHexString() === cursor);
        indexOfRoom  = rooms.indexOf(cursorRoom);
      }
      rooms = rooms.slice(indexOfRoom + 1, indexOfRoom + 1 + count) as [any];
      
      const roomsData = await Promise.all(rooms.map((roomId) => this.roomService.findRoomById(roomId.toHexString())));
      const edges = (await Promise.all(roomsData.map(async (room) => {
        const lastMessage = '';
        if (room.messages?.length) {
          const lastMessageId = room.messages[room.messages.length - 1];
          //waitng for message implement
        }

        const usersData = await Promise.all(room.joinedUsers.map(async (userId) => this.userService.findUserById(userId, {
          name: 1,
          email: 1,
          phone: 1,
        })));

        return {
          node: {
            _id: Types.ObjectId(room._id),
            title: room.title,
            users: usersData,
            lastMessage,
          },
          cursor: room._id,
        };
      })));

      const startCursor = edges.length >= 1 ? edges[0].cursor : '';
      const endCursor = edges.length >= 1 ? edges[edges.length - 1].cursor : '';

      return {
        pageInfo: {hasPreviousPage: false, hasNextPage: false, startCursor, endCursor},
        edges,
        statusCode: 200,
      };

    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          error: 'Some thing went wrong',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(_returns => BasicResponse)
  async RoomGraphCreateRoom(@Context() context,  @Args('email') email: string) {
    try {
      const { user: { _id } } = context.req;
      const currentUser = await this.userService.findUserById(_id, { rooms: 1 });
      const addedUser = await this.userService.findUserByEmail(email, { rooms: 1 });
      const roomsExits = await this.roomService.findRoomWithJoinedUsers([_id, addedUser._id], { _id: 1 });
      if (roomsExits?.length) {
        throw new Error("Alredy connected");
      }
      if (addedUser) {
        const joinedUsers = [_id, addedUser._id];
        const newRoom = await this.roomService.createRoom({
          joinedUsers,
          title: 'none',
          messages: [],
        });
        await this.userService.updateRoomsOfUser(_id, [...currentUser.rooms, newRoom._id]);
        await this.userService.updateRoomsOfUser(addedUser._id, [...addedUser.rooms, newRoom._id]);
        return {
          message: 'create room success',
          statusCode: 200,
        }
      } else {
        throw new Error("User not found")
      }
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          error: 'Some thing went wrong',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
