import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { JwtService } from '@nestjs/jwt';
import { Model } from "mongoose";
import { Utils } from 'utils/Utils';
import * as Relay from 'graphql-relay';
import { User } from "User/interfaces/user.interfaces";
import { EnvironmentService } from 'Enviroment/enviroment.service';
import { EnvConstants } from 'common/constants/EnvConstants';
@Injectable()
export class UserService {
  constructor(
    @InjectModel("User") private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly environmentService: EnvironmentService,
  ) {}

  public async createUser(newUser): Promise<User> {
    try {
      newUser.password = await Utils.hashPassword(newUser.password);
      const createdUser = await this.userModel.create(newUser);
      return createdUser;
    } catch (err) {
      console.log(err);
    }
    return this.userModel.create(newUser);
  }

  public findUserByEmail(userEmail: string, projection?): Promise<User> {
    const findConditions = {
      email: userEmail.toLowerCase(),
    }
    return this.userModel.findOne(findConditions, projection).exec();
  }

  public getAuthToken(data) {
    const dataGenToken = {...data};
    delete dataGenToken.password
    delete dataGenToken.signatures
    const token = this.jwtService.sign(dataGenToken, {
      expiresIn: '15 minutes',
    });
    
    const refreshToken = this.jwtService.sign(dataGenToken, {
      expiresIn: '15 days',
    });
    return { token, refreshToken }
  }

  findAll(): string {
    // const parsedUserId = Relay.fromGlobalId(where.id);
    // if (!isUUID(parsedUserId.id)) {
    //   return undefined;
    // }
    // const user = await this.userRepository.findOne(parsedUserId.id);
    // if (!user) {
    //   return user;
    // }
    // this.userRepository.merge(user, data);
    // return await this.userRepository.save(user);
    return 'ok'
  }
}