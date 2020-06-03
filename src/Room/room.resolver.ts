import { HttpException, HttpStatus, UseGuards, } from '@nestjs/common';
import { Query, Resolver, Mutation, Args, Context, ResolveField, Parent, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { toGlobalId } from 'graphql-relay';
import { RoomService } from 'Room/room.service';
import { Room } from 'Room/models/room.models';
import { CreatedConnectionPayload, RoomList, RoomsConnection, ChatConnection, ChatList, ChatEdge } from 'Room/graphql-types/room.graphql';
import { GqlAuthGuard } from 'Graphql/graphql.guard';
import { UserService } from 'User/user.service';
import { Types } from 'mongoose';
import { BasicResponse } from 'common/common-models';

const pubSub = new PubSub();

@Resolver(() => RoomList)
export class RoomListResolvers {
  constructor(private readonly roomService: RoomService, private readonly userService: UserService) {}

  @ResolveField(type => RoomsConnection)
  async allRooms(@Parent() myRoomList: RoomList, @Args('first') count: number, @Args('after') cursor: string ) {
    try {
      let indexOfRoom = -1;
      const { roomsConection } = myRoomList;
      const roomsData = await Promise.all(roomsConection.map((roomId) => this.roomService.findRoomById(roomId)));
      roomsData.sort((room1, room2) => room1.updatedAt - room2.updatedAt);
      if (cursor) {
        const cursorRoom = roomsData.find((room) => room._id.toString() === cursor);
        indexOfRoom  = roomsData.indexOf(cursorRoom);
      }
      const roomsDataPaging = roomsData.slice(indexOfRoom + 1, indexOfRoom + 1 + count) as [any];
      const edges = (await Promise.all(roomsDataPaging.map(async (room) => {
        let lastMessage = '';
        if (room.messages?.length) {
          const lastMessageId = room.messages[room.messages.length - 1];
          const lastMessageIns = await this.roomService.getMessageWithId(lastMessageId, { message: 1 });
          lastMessage = lastMessageIns.message || '';
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

      const hasNextPage = roomsData.length && roomsDataPaging.length && roomsData[roomsData.length - 1]._id !== roomsDataPaging[roomsDataPaging.length - 1]._id;
      return {
        pageInfo: {hasPreviousPage: false, hasNextPage , startCursor, endCursor},
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

@Resolver(() => ChatList)
export class ChatListResolvers {
  constructor(private readonly roomService: RoomService, private readonly userService: UserService) {}

  @ResolveField(type => ChatConnection)
  async allChat(@Parent() myChatList: ChatList, @Args('last') count: number, @Args('before') cursor: string ) {
    try {
      const { chatConnection } = myChatList;
      const chatDatas = await Promise.all(chatConnection.map((chatId) => this.roomService.getMessageWithId(chatId)));
      let indexOfRoom = chatDatas.length - 1;
      if (cursor) {
        const cursorRoom = chatDatas.find((chat) => chat._id.toString() === cursor);
        indexOfRoom  = chatDatas.indexOf(cursorRoom) - 1;
      }
      const chatDatasPaging = chatDatas.slice(indexOfRoom - count + 1, indexOfRoom + 1) as [any];
      const edges = (await Promise.all(chatDatasPaging.map(async (chat) => {
        const ownerMessage = await this.userService.findUserById(chat.ownerId, { name: 1 });

        return {
          node: {
            _id: Types.ObjectId(chat._id),
            relayId: toGlobalId("Chat", chat._id),
            ownerId: chat.ownerId,
            message: chat.message,
            ownerName: ownerMessage.name,
            createdAt: chat.createdAt,
          },
          cursor: chat._id,
        };
      })));

      const startCursor= edges.length >= 1 ? edges[0].cursor : '';
      const endCursor = edges.length >= 1 ? edges[edges.length - 1].cursor : '';

      const hasPreviousPage = chatDatas.length && chatDatasPaging.length && chatDatas[0]._id !== chatDatasPaging[0]._id;
      return {
        pageInfo: {hasPreviousPage, hasNextPage: false , startCursor, endCursor},
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

  @Subscription(_returns => ChatEdge, { name: 'chatAdded', filter: (payload, variables) => payload.chatAdded.receiverId === variables.roomId })
  addNewChatHandler(@Args('roomId') roomId: String) {
    return pubSub.asyncIterator('chatAdded');
  }

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
  @Query(_returns => ChatList)
  async RoomGraphGetAllMessage(@Context() context, @Args("roomId") roomId: string){
    try {
      const currentRoom = await this.roomService.findRoomById(roomId);
      const messages = currentRoom.messages as [any];

      return {
        chatConnection: messages
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

  @UseGuards(GqlAuthGuard)
  @Mutation(_returns => BasicResponse)
  async RoomGraphAddNewChat(@Context() context,  @Args('message') message: string, @Args('roomId') roomId: string) {
    try {
      const { user: { _id } } = context.req;
      const currentUser = await this.userService.findUserById(_id);
      const room = await this.roomService.findRoomById(roomId);
      const newMessage = await this.roomService.addMessage({
        message,
        ownerId: _id,
      });
      await this.roomService.updateMessagesInRoom(roomId, [...room.messages, newMessage._id]);
      pubSub.publish('chatAdded', { chatAdded: {
        node: {
          _id: Types.ObjectId(newMessage._id),
          relayId: toGlobalId("Chat", newMessage._id),
          ownerId: _id,
          message: message,
          ownerName: currentUser.name,
          createdAt: newMessage.createdAt,
        },
        cursor: newMessage._id,
        receiverId: roomId,
      }})
      return {
        message: 'success add message',
        statusCode: 200,
      }
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
