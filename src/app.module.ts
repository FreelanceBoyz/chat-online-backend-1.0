import { MailModule } from './Mailer/mailer.module';
import { Module } from '@nestjs/common';
import { GraphqlModule } from 'Graphql/graphql.module';
import { MongoModule } from 'Database/mongo.module';
import { UserModule } from 'User/user.module';
import { RoomModule } from 'Room/room.module';
import { EnvironmentModule } from 'Enviroment/enviroment.module';
import { AppController } from 'app.controller';

@Module({
  imports: [
    UserModule,
    MongoModule,
    GraphqlModule,
    EnvironmentModule,
    RoomModule,
    MailModule
  ],
  controllers: [AppController]
})
export class AppModule {}
