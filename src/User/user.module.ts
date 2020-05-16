import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "User/user.schema";
import { UserResolvers } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
  ],
  providers: [UserService, UserResolvers],
  exports: [UserService]
})
export class UserModule {}
