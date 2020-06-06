import { EmailVerifyTokenPayload, EmailVerifyTokenInput } from './../EmailVerifyToken/graphql-types/emailverifytoken.graphql';
import { EmailVerifyTokenService } from 'EmailVerifyToken/emailverifytoken.service';
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
  SigninWithInput,
  ResetPasswordInput
} from 'User/graphql-types/user.graphql';
import { GqlAuthGuard } from 'Graphql/graphql.guard';
import { MailerService } from '@nestjs-modules/mailer';
import { BasicResponse } from 'common/common-models';

@Resolver(() => User)
export class UserResolvers {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailerService,
    private readonly emailVerifyTokenService: EmailVerifyTokenService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
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
  @Query(() => UserPayload)
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

  @Mutation(() => BasicResponse)
  async UserGraphSignUp(@Args('input') createUserData: CreateUserInput) {
    const user = await this.userService.findUserByEmail(createUserData.email, {
      _id: 1,
    });
    if (user) {
      throw new HttpException(
        {
          error: 'This email is already existed',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const createdUser = await this.userService.createUser(createUserData);

    const userId = createdUser._id.toString();

    const emailVerifyToken = await this.emailVerifyTokenService.create(userId);

    this.mailService.sendMail({
      to: createdUser.email,
      from: 'no-reply@chatapplication', 
      subject: 'Confirm Your Email - Chat Application',  
      html: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + 'localhost:3000' + '\/confirmation\?token=' + emailVerifyToken.token + '.\n', 
    });

    return {
      message: 'success',
      statusCode: 200,
    }
  }

  @Mutation(() => UserPayload)
  async UserGraphSignIn(@Args('input') signInData: SignInUserInput) {
    const user = await this.userService.findUserByEmail(signInData.email);
    if (user) {
      if (user.isVerified) {
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
      }
      else {
        throw new HttpException(
          {
            error: 'Account is not verified',
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

  @Mutation(() => UserPayload)
  async UserGraphSignInWith(@Args('input') signinWithInput: SigninWithInput) {
    const user = await this.userService.findUserByEmail(signinWithInput.email);
    if (user) {
      if (user.password) {
        throw new HttpException(
          {
            error: 'This account is signed with email',
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const { token, refreshToken } = this.userService.getAuthToken({_id: user._id});
      return {
        user,
        token,
        refreshToken
      }
    }
    else {
      const newUser = {
        name: signinWithInput.name,
        email: signinWithInput.email,
        isVerified: true,
        phone: null,
        password: null
      };
      const createdUser = await this.userService.createUser(newUser);
      if (createdUser) {
        const { token, refreshToken } = this.userService.getAuthToken({_id: createdUser._id });
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

  @Mutation(() => EmailVerifyTokenPayload)
  async UserGraphVerifyEmailToken(@Args('input') emailVerifyTokenInput: EmailVerifyTokenInput) {
    const savedToken = await this.emailVerifyTokenService.findOne(emailVerifyTokenInput.token);
    if (!savedToken) {
      return {
        isVerified: false,
      }
    }
    else {
      const updatedUser = await this.userService.updateVerifyMail(savedToken.userId, true);
      if (updatedUser) {
        await this.emailVerifyTokenService.delete(savedToken._id);
        return {
          isVerified: true,
        }
      }
      else {
        return {
          isVerified: false,
        }
      }
    }
  }

  @Mutation(() => BasicResponse)
  async UserGraphSendMailResetPassword(@Args('email') email: string) {
    const user = await this.userService.findUserByEmail(email);
    if (user) {
      if (user.password === null) {
        return {
          message: 'This account is signed with Google',
          statusCode: 404
        }
      }
      const userId = user._id.toString();
      const verifyToken = await this.emailVerifyTokenService.create(userId);
      this.mailService.sendMail({
        to: user.email,
        from: 'no-reply@chatapplication', 
        subject: 'Reset your password - Chat Application',  
        html: 'Hello,\n\n' + 'Click this link to reset your password: \nhttp:\/\/' + 'localhost:3000' + '\/resetpassword\?token=' + verifyToken.token + '.\n',
      });
      return {
        message: 'Check your email to reset your password.',
        statusCode: 200
      }
    }
    else {
      return {
        message: 'This email is not existed',
        statusCode: 404
      }
    }
  }

  @Mutation(() => BasicResponse)
  async UserGraphResetPassword(@Args('input') resetPasswordInput: ResetPasswordInput) {
    const savedToken = await this.emailVerifyTokenService.findOne(resetPasswordInput.token);
    if (savedToken) {
      const updatedUser = await this.userService.updatePassword(savedToken.userId, resetPasswordInput.password);
      if (updatedUser) {
        await this.emailVerifyTokenService.delete(savedToken._id);
        return {
          message: 'Password is changed successfully',
          statusCode: 201
        }
      }
      else {
        throw new HttpException(
          {
            error: 'Error when update user password',
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    else {
      throw new HttpException(
        {
          error: 'Error when finding this user',
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
