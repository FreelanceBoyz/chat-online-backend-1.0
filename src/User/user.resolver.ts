import {
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Query, Resolver, Mutation, Args, Context } from '@nestjs/graphql';

import { UserService } from 'User/user.service';
import { User } from 'User/models/user.models';
import {
  UserPayload,
  CreateUserInput,
  SignInUserInput,
} from 'User/graphql-types/user.graphql';
import { GqlAuthGuard } from 'Graphql/graphql.guard';

@Resolver(() => User)
export class UserResolvers {
  constructor(
    private readonly userService: UserService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(_returns => User)
  async UserGraphGetInfo(@Context() context) {
    try {
      const { user: { _id } } = context.req;
      const userInfo = await this.userService.findUserById(_id);
      return userInfo;
    } catch(e) {
      throw new HttpException(
        {
          error: 'Some thing went wrong',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(GqlAuthGuard)
  @Query(_returns => UserPayload)
  async UserGraphVerifyToken(@Context() context) {
    const { user: { _id } } = context.req;
    const userInfo = await this.userService.findUserById(_id);
    const { token, refreshToken } = this.userService.getAuthToken({ _id });
    return {
      user: userInfo,
      token,
      refreshToken,
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
      const { token, refreshToken } = this.userService.getAuthToken({ _id: createdUser._id });
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
        const { token, refreshToken } = this.userService.getAuthToken({_id: user._id});
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
