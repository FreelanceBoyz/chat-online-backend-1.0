import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Room, RoomPermission } from "Room/interfaces/room.interfaces";

@Injectable()
export class RoomService {
  constructor(
    @InjectModel("Room") private readonly roomModel: Model<Room>,
    @InjectModel("RoomPermission") private readonly roomPermissionModel: Model<RoomPermission>,
  ) {}

  public async getAllUserPermissionWithRoomId(roomId) {
    return this.roomPermissionModel.find({ roomId });
  }
  
  public async findUserPermissionInRoom(roomId, refId) {
    return this.roomPermissionModel.findOne({ roomId, refId });
  }

  public async createRoom(room) {
    return this.roomModel.create(room);
  }

  public async createRoomPermission(roomPermission) {
    return this.roomPermissionModel.create(roomPermission);
  }
}