import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { User } from 'User/models/user.models';

@ObjectType()
export class CreateUserPayload {
  @Field((_type) => User)
  user: User;
  @Field()
  token: string;
  @Field()
  refreshToken: string;
}

@InputType()
export class CreateUserInput {
  @Field()
  name: string;
  @Field()
  email: string;
  @Field()
  password: string;
}