import { Module } from '@nestjs/common';
import { GraphqlModule } from 'Graphql/graphql.module';
import { MongoModule } from 'Database/mongo.module';
import { UserModule } from 'User/user.module';

@Module({
  imports: [
    UserModule,
    MongoModule,
    GraphqlModule,
  ],
})
export class AppModule {}
