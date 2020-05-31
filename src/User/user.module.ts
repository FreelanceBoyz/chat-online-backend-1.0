import { EmailVerifyTokenModule } from 'EmailVerifyToken/emailverifytoken.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "User/user.schema";
import { UserResolvers } from './user.resolver';
import { UserService } from './user.service';
import { JwtModule } from "@nestjs/jwt";
import { EnvironmentModule } from 'Enviroment/enviroment.module';
import { EnvironmentService } from "Enviroment/enviroment.service";
import { EnvConstants } from 'common/constants/EnvConstants';
import { GraphqlModule } from 'Graphql/graphql.module';
import { GqlAuthGuard } from 'Graphql/graphql.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [EnvironmentModule],
      useFactory: async (environmentService: EnvironmentService) => ({
        secret: environmentService.getByKey(
          EnvConstants.JWT_SECRET_KEY,
        ),
        signOptions: {
          expiresIn: "7 days",
        },
      }),
      inject: [EnvironmentService],
    }),
    GraphqlModule,
    EmailVerifyTokenModule
  ],
  providers: [UserService, UserResolvers, GqlAuthGuard],
  exports: [UserService]
})
export class UserModule {}
