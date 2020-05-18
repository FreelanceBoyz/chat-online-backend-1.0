import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Query, Resolver, Mutation, Args } from '@nestjs/graphql';

import { UserService } from 'User/user.service';
import { User } from 'User/models/user.models';
import { BasicResponse } from 'common/common-models';
import {
  CreateUserPayload,
  CreateUserInput,
} from 'User/graphql-types/user.graphql';
@Resolver(() => User)
export class UserResolvers {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Query(_returns => BasicResponse)
  async UserGraphInfo() {
    return {
      message: 'cac',
      statusCode: 200,
    };
  }

  @Mutation(_returns => CreateUserPayload)
  async UserGraphSignUp(@Args('input') createUserData: CreateUserInput) {
    const user = await this.userService.findUserByEmail(createUserData.email, {
      _id: 1,
    });
    if (user) {
      throw new HttpException(
        {
          error: 'This email already exists',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const createdUser = await this.userService.createUser(createUserData);
    if (createdUser) {
      const { token, refreshToken } = this.userService.getAuthToken(createdUser);
      return {
        user: createdUser,
        token,
        refreshToken,
      };
    } else {
      throw new HttpException(
        {
          error: 'Error when create user',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
