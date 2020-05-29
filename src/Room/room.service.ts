import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Room } from "Room/interfaces/room.interfaces";

@Injectable()
export class RoomService {
  constructor(
    @InjectModel("Room") private readonly roomModel: Model<Room>,
  ) {}

  public async findRoomById(_id, projection?) {
    return this.roomModel.findOne({ _id }, projection);
  }

  public async createRoom(room) {
    return this.roomModel.create(room);
  }

  public async findRoomWithJoinedUsers(condition, projection?) {
    return this.roomModel.find({ joinedUsers: { $all: condition}}, projection);
  }
}