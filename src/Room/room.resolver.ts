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
  @Mutation(_returns => BasicResponse)
  async RoomGraphCreateConnection(@Context() context, @Args('mail') userMail: string) {
    try {
      const {
        user: { _id },
      } = context.req;

      const connectedUser = await this.userService.findUserByEmail(userMail);
      if (connectedUser) {
        
      } else {
        throw new Error("User not found");
      }
    } catch(e) {

    }
  }
}
