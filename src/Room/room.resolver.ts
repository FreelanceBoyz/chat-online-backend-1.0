import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { Query, Resolver, Mutation, Args, Context } from '@nestjs/graphql';

import { RoomService } from 'Room/room.service';
import { Room } from 'Room/models/room.models';
import { RoomPayload, RoomInput } from 'Room/graphql-types/room.graphql';
import { BasicResponse } from 'common/common-models';
import { GqlAuthGuard } from 'Graphql/graphql.guard';
import { UserService } from 'User/user.service';

@Resolver(() => Room)
export class RoomResolvers {
  constructor(private readonly roomService: RoomService, private readonly userService: UserService) {}

  @UseGuards(GqlAuthGuard)
  @Query(_returns => BasicResponse)
  async RoomGraphGetAllUserInRoom(@Context() context, @Args('input') roomData: RoomInput) {
    try {
      const {
        user: { _id },
      } = context.req;
      const { roomId } = roomData;
      const userPermission = await this.roomService.findUserPermissionInRoom(roomId, _id);
      if (userPermission) {
        const userPermissions = await this.roomService.getAllUserPermissionWithRoomId(roomId);
        return {
          message: 'success',
          statusCode: 200,
        }
      } else {
        return {
          message: 'error',
          statusCode: 403,
        }
      }
    } catch (e) {
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
  @Query(_returns => [RoomPayload])
  async RoomGraphGetAllRoom(@Context() context) {
    try {
      const {
        user: { _id },
      } = context.req;

      const roomsPermission = await this.roomService.getAllRoomOfUser(_id, { roomId: 1, role: 1, _id: -1});
      const allRoomsData = await Promise.all(roomsPermission.map( async (permission) => {
        const subRoomsPermission = await this.roomService.getAllUserPermissionWithRoomId(permission.roomId);
        const fileterRoomsPermission = subRoomsPermission.filter((el) => el.refId !== _id);
        const room = await this.roomService.getRoomById(permission.roomId);
        const userDatas = await Promise.all(fileterRoomsPermission.map(async (roomPermission) => {
          const user = await this.userService.findUserById(roomPermission.refId, { email: 1, name: 1 });
          return user;
        }));
        return {
          room: {
            title: room.title,
            users: [userDatas],
            role: permission.role,
          },
          statusCode: 200,
        }
      }))

      return allRoomsData;
    } catch(e) {
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
  @Mutation(_returns => RoomPayload)
  async RoomGraphCreateConnection(@Context() context, @Args('mail') userMail: string) {
    try {
      const {
        user: { _id },
      } = context.req;

      const connectedUser = await this.userService.findUserByEmail(userMail, {
        email: 1,
        name: 1,
      });

      if (connectedUser) {
        const newRoom = await this.roomService.createRoom({ title: "" });
        const ownerRoomPermission = {
          roomId: newRoom._id,
          refId: _id,
          role: 'owner',
        };
        const connectedRoomPermission = {
          roomId: newRoom._id,
          refId: connectedUser._id,
          role: 'client',
        }

        await this.roomService.createRoomPermission(ownerRoomPermission);
        await this.roomService.createRoomPermission(connectedRoomPermission);

        return {
          room: {
            title: newRoom.title,
            users: [connectedUser],
            role: 'owner',
          },
          statusCode: 200,
        }
      } else {
        throw new Error("User not found");
      }
    } catch(e) {
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
