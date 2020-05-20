import { Field, ID, ObjectType } from '@nestjs/graphql';
import { toGlobalId } from 'graphql-relay';
import { Node } from 'Node/models/node.models';

@ObjectType({ implements: Node })
export class User implements Node {
  readonly id: string;

  @Field((_type) => ID, { name: 'id' })
  get relayId(): string {
    return toGlobalId('User', this.id);
  }

  readonly createdAt: Date;

  readonly updatedAt: Date;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  phone: string;
}
