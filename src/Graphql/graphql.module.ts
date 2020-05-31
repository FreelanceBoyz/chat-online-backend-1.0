import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { GqlAuthGuard } from './graphql.guard';
import { JwtModule } from "@nestjs/jwt";
import { EnvironmentModule } from 'Enviroment/enviroment.module';
import { EnvironmentService } from "Enviroment/enviroment.service";
import { EnvConstants } from 'common/constants/EnvConstants';
@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.graphql',
      installSubscriptionHandlers: true,
      formatError: (err) => {
        return {
          message: err.extensions.exception.response.error,
          locations: null,
          path: null,
          extensions: null
        }
      }
    }),
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
  ],
  providers: [GqlAuthGuard],
  exports: [GqlAuthGuard],
})
export class GraphqlModule { }
