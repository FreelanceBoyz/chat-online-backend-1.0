import { ObjectType, Field, InputType, Args, ResolveField } from '@nestjs/graphql';
import * as Relay from 'graphql-relay';
import { Room } from 'Room/models/room.models';
import { Chat } from 'Room/models/chat.models';
import { PageInfo } from 'common/common-models';

@ObjectType({isAbstract: true})
abstract class RoomEdge implements Relay.Edge<Room> {
  @Field(() => Room)
  readonly node!: Room;

  @Field((_type) => String)
  readonly cursor!: Relay.ConnectionCursor;
}
@ObjectType()
export class RoomsConnection implements Relay.Connection<Room> {
  @Field()
  readonly pageInfo!: PageInfo;

  @Field(() => [RoomEdge])
  readonly edges!: Relay.Edge<Room>[];

  @Field()
  statusCode: number;
}


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