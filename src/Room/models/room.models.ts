import { Field, ID, ObjectType } from '@nestjs/graphql';
import { toGlobalId } from 'graphql-relay';
import { Node } from 'Node/models/node.models';
import { User } from 'User/models/user.models';

@ObjectType({ implements: Node })
export class Room implements Node {
  readonly id: string;

  @Field((_type) => ID, { name: '_id' })
  get relayId(): string {
    return toGlobalId('Room', this.id);
  }

  readonly createdAt: Date;

  readonly updatedAt: Date;

  @Field()
  title: string;

  @Field((_type) => [User])
  users: [User]

  @Field()
  lastMessage: string
}

