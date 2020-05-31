import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { Query, Resolver, Mutation, Args, Context, ResolveField, Parent } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { toGlobalId } from 'graphql-relay';
import { RoomService } from 'Room/room.service';
import { Room } from 'Room/models/room.models';
import { CreatedConnectionPayload, RoomList, RoomsConnection } from 'Room/graphql-types/room.graphql';
import { GqlAuthGuard } from 'Graphql/graphql.guard';
import { UserService } from 'User/user.service';
import { Types } from 'mongoose';

@Resolver(() => RoomList)
export class RoomListResolvers {
  constructor(private readonly roomService: RoomService, private readonly userService: UserService) {}

  @ResolveField(type => RoomsConnection)
  async allRooms(@Parent() myRoomList: RoomList, @Args('first') count: number, @Args('after') cursor: string ) {
    try {
      let indexOfRoom = -1;
      let { roomsConection } = myRoomList;
      if (cursor) {
        const cursorRoom = roomsConection.find((room) => room === cursor);
        indexOfRoom  = roomsConection.indexOf(cursorRoom);
      }
      roomsConection = roomsConection.slice(indexOfRoom + 1, indexOfRoom + 1 + count) as [any];
      const roomsData = await Promise.all(roomsConection.map((roomId) => this.roomService.findRoomById(roomId)));
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
            relayId: toGlobalId("Room", room._id),
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
    } catch(e) {
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
@Resolver(() => Room)
export class RoomResolvers {
  constructor(private readonly roomService: RoomService, private readonly userService: UserService) {}

  @UseGuards(GqlAuthGuard)
  @Query(_returns => RoomList)
  async RoomGraphGetAllRoom(@Context() context){
    try {
      const { user: { _id } } = context.req;
      const currentUser = await this.userService.findUserById(_id, { rooms: 1 });
      const rooms = currentUser.rooms as [any];

      return {
        roomsConection: rooms
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

  @UseGuards(GqlAuthGuard)
  @Mutation(_returns => CreatedConnectionPayload)
  async RoomGraphCreateRoom(@Context() context,  @Args('email') email: string) {
    const { user: { _id } } = context.req;
    const currentUser = await this.userService.findUserById(_id);
    const addedUser = await this.userService.findUserByEmail(email);
    if (addedUser) {
      if (_id.toString() === addedUser._id.toString()) {
        throw new HttpException({
          error: "Can't connect with your self",
          statusCode: HttpStatus.BAD_REQUEST
        }, HttpStatus.BAD_REQUEST);
      }
      const roomsExits = await this.roomService.findRoomWithJoinedUsers([_id, addedUser._id], { _id: 1 });
      if (roomsExits?.length) {
        throw new HttpException({
          error: "Already connected",
          statusCode: HttpStatus.BAD_REQUEST
        }, HttpStatus.BAD_REQUEST);
      }
      const joinedUsers = [_id, addedUser._id];
      const newRoom = await this.roomService.createRoom({
        joinedUsers,
        title: 'none',
        messages: [],
      });
      await this.userService.updateRoomsOfUser(_id, [...currentUser.rooms, newRoom._id]);
      await this.userService.updateRoomsOfUser(addedUser._id, [...addedUser.rooms, newRoom._id]);
      return {
        room: {
          cursor: newRoom._id,
          node: {
            _id: newRoom._id,
            relayId: toGlobalId("Room", newRoom._id),
            title: newRoom.title,
            lastMessage: '',
            users: [currentUser, addedUser],
          },
        },
        basicResponse: {
          message: 'create room success',
          statusCode: 200,
        }
      }
    } else {
      throw new HttpException({
        error: "User not found",
        statusCode: HttpStatus.BAD_REQUEST
      }, HttpStatus.BAD_REQUEST);
    }
  }
}
