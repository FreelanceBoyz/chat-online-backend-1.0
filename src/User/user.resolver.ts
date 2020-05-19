import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Query, Resolver, Mutation, Args } from '@nestjs/graphql';

import { UserService } from 'User/user.service';
import { User } from 'User/models/user.models';
import { BasicResponse } from 'common/common-models';
import {
  UserPayload,
  CreateUserInput,
  SignInUserInput,
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

  @Mutation(_returns => UserPayload)
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

  @Mutation(_returns => UserPayload)
  async UserGraphSignIn(@Args('input') signInData: SignInUserInput) {
    const user = await this.userService.findUserByEmail(signInData.email);
    if (user) {
      const isMatch = await user.comparePassword(signInData.password);
      if (isMatch) {
        const { token, refreshToken } = this.userService.getAuthToken(user);
        return {
          user,
          token,
          refreshToken,
        };
      } else {
        throw new HttpException(
          {
            error: 'Password incorrect',
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }
    } else {
      throw new HttpException(
        {
          error: 'User not found',
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
