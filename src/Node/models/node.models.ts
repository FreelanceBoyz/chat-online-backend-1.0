import { InterfaceType, Field, ID } from '@nestjs/graphql';

@InterfaceType()
export abstract class Node {
  @Field()
  _id: string;

  @Field({ name: 'id'})
  relayId: string
}