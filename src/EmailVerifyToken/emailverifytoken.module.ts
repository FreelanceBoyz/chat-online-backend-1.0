import { GraphqlModule } from 'Graphql/graphql.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { EmailVerifyTokenService } from './emailverifytoken.service';
import { EmailVerifyToken } from './schemas/emailverifytoken.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'EmailVerifyToken', schema: EmailVerifyToken}]),
        GraphqlModule
    ],
    providers: [EmailVerifyTokenService],
    exports: [EmailVerifyTokenService]
})
export class EmailVerifyTokenModule {}