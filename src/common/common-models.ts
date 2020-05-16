import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BasicResponse {
  @Field()
  message: string;

  @Field()
  statusCode: number;
}