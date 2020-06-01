import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { RoomResolvers, RoomListResolvers, ChatListResolvers } from './room.resolver';
import { RoomService } from './room.service';
import { GraphqlModule } from 'Graphql/graphql.module';
import { JwtModule } from "@nestjs/jwt";
import { EnvironmentModule } from 'Enviroment/enviroment.module';
import { EnvironmentService } from "Enviroment/enviroment.service";
import { EnvConstants } from 'common/constants/EnvConstants';
import { GqlAuthGuard } from 'Graphql/graphql.guard';
import { RoomSchema } from './schemas/room.schema';
import { ChatSchema } from './schemas/chat.schema';
import { UserModule } from 'User/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Room", schema: RoomSchema }]),
    MongooseModule.forFeature([{ name: "Chat", schema: ChatSchema }]),
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
    UserModule,
  ],
  providers: [RoomService, RoomResolvers, RoomListResolvers, ChatListResolvers, GqlAuthGuard],
  exports: [RoomService]
})
export class RoomModule {}
