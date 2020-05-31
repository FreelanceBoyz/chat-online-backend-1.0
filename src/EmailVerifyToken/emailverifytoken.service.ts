import { Utils } from 'utils/Utils';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { EmailVerifyToken } from './interfaces/emailverifytoken.interface';

@Injectable()
export class EmailVerifyTokenService {
    constructor(@InjectModel('EmailVerifyToken') private readonly emailVerifyToken: Model<EmailVerifyToken>) {}

    async findOne(token: string): Promise<EmailVerifyToken> {
        return await this.emailVerifyToken.findOne({token: token});
    }

    async create(userId: string): Promise<EmailVerifyToken> {
        const newToken = await Utils.hashPassword(userId);
        const newEmailVerifyToken = this.emailVerifyToken({
            userId: userId,
            token: newToken
        });
        return await this.emailVerifyToken.create(newEmailVerifyToken);
    }

    async delete(id: string) {
        return await this.emailVerifyToken.findByIdAndRemove(id);
    }
}
