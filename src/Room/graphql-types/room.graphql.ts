import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { Room } from 'Room/models/room.models';
import { Chat } from 'Room/models/chat.models';

@ObjectType()
export class RoomPayload {
  @Field((_type) => Room)
  room: Room;
  @Field()
  statusCode: number;
}

@InputType()
export class RoomInput {
  @Field()
  roomId: string;
}

@ObjectType()
export class ChatPayload {
  @Field((_type) => Chat)
  user: Chat;
}

@InputType()
export class ChatInput {
  @Field()
  message: string;
  @Field()
  roomId: string;
}