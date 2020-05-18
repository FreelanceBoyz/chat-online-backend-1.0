import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "User/user.schema";
import { UserResolvers } from './user.resolver';
import { UserService } from './user.service';
import { JwtModule } from "@nestjs/jwt";
import { EnvironmentModule } from 'Enviroment/enviroment.module';
import { EnvironmentService } from "Enviroment/enviroment.service";
import { EnvConstants } from 'common/constants/EnvConstants';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [EnvironmentModule],
      useFactory: async (environmentService: EnvironmentService) => ({
        secretOrPrivateKey: environmentService.getByKey(
          EnvConstants.JWT_SECRET_KEY,
        ),
        signOptions: {
          expiresIn: "7 days",
        },
      }),
      inject: [EnvironmentService],
    }),
  ],
  providers: [UserService, UserResolvers],
  exports: [UserService]
})
export class UserModule {}
