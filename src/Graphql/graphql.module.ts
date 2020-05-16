import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { join } from 'path';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.graphql',
    }),
  ],
})
export class GraphqlModule { }
