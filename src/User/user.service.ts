import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { isUUID } from '@nestjs/common/utils/is-uuid';
import * as Relay from 'graphql-relay';
import { User } from "User/interfaces/user.interfaces";

@Injectable()
export class UserService {

  constructor(
    @InjectModel("User") private readonly userModel: Model<User>,
  ) {}

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