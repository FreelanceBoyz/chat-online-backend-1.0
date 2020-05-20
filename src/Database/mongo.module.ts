import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EnvironmentModule } from "Enviroment/enviroment.module";
import { EnvironmentService } from "Enviroment/enviroment.service";
import { EnvConstants } from "common/constants/EnvConstants";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [EnvironmentModule],
      inject: [EnvironmentService],
      useFactory: (environmentService: EnvironmentService) => ({
        uri: environmentService.getByKey(EnvConstants.MONGO_URL),
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
      }),
    }),
  ],
})

export class MongoModule { }
