import { Field, ObjectType } from '@nestjs/graphql';
import { Node } from 'Node/models/node.models';
import { User } from 'User/models/user.models';

@ObjectType({ implements: Node })
export class Room implements Node {

  readonly createdAt: Date;

  readonly updatedAt: Date;

  @Field({ name: 'id'})
  relayId: string
  
  @Field()
  _id: string;

  @Field()
  title: string;

  @Field((_type) => [User])
  users: [User]

  @Field()
  lastMessage: string
}

