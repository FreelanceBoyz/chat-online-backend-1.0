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
  GoogleSigninInput
} from 'User/graphql-types/user.graphql';
import { GqlAuthGuard } from 'Graphql/graphql.guard';
import { MailerService } from '@nestjs-modules/mailer';

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

  @Mutation(() => UserPayload)
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

    const userId = createdUser._id.toString();

    const emailVerifyToken = await this.emailVerifyTokenService.create(userId);

    this.mailService.sendMail({
      to: createdUser.email,
      from: 'no-reply@chatapplication', 
      subject: 'Confirm Your Email - Chat Application',  
      html: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + 'localhost:3000' + '\/confirmation\?token=' + emailVerifyToken.token + '.\n', 
    });
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
  async UserGraphSignInWithGoogle(@Args('input') googleSigninInput: GoogleSigninInput) {
    console.log('This');
    const user = await this.userService.findUserByEmail(googleSigninInput.email);
    console.log('That');
    if (user) {
      console.log('This Id');
      console.log(user._id);
      const { token, refreshToken } = this.userService.getAuthToken({_id: user._id});
      return {
        user,
        token,
        refreshToken
      }
    }
    else {
      const newUser = {
        name: googleSigninInput.name,
        email: googleSigninInput.email,
        isVerified: true,
        phone: null,
        password: null
      };
      const createdUser = await this.userService.createUser(newUser);
      if (createdUser) {
        console.log("User ID");
        console.log(createdUser._id);
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
}
