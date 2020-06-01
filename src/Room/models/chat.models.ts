import { Field, ObjectType } from '@nestjs/graphql';
import { Node } from 'Node/models/node.models';

@ObjectType({ implements: Node })
export class Chat implements Node {
  @Field()
  _id: string;
  
  @Field((_types) => String)
  createdAt: Date;

  readonly updatedAt: Date;

  @Field({ name: 'id'})
  relayId: string

  @Field()
  message: string;

  @Field()
  ownerName: string;

  @Field()
  ownerId: string;
}
