import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { User } from 'User/models/user.models';

@ObjectType()
export class UserPayload {
  @Field(() => User)
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
  @Field()
  phone: string;
}

@InputType()
export class SignInUserInput {
  @Field()
  email: string;
  @Field()
  password: string;
}

@InputType()
export class GoogleSigninInput {
  @Field()
  email: string;
  @Field()
  name: string;
}