import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Room, Chat } from "Room/interfaces/room.interfaces";

@Injectable()
export class RoomService {
  constructor(
    @InjectModel("Room") private readonly roomModel: Model<Room>,
    @InjectModel("Chat") private readonly chatModel: Model<Chat>,
    ) {}

  public async findRoomById(_id, projection?) {
    return this.roomModel.findOne({ _id }, projection);
  }

  public async createRoom(room) {
    return this.roomModel.create(room);
  }

  public async updateMessagesInRoom(_id, newMessages) {
    return this.roomModel.updateOne(
      { _id },
      {
        $set: {
          messages: newMessages,
        },
      },
    )
  }

  public async getMessageWithId(_id, projection?) {
    return this.chatModel.findOne({ _id }, projection);
  }

  public async addMessage(newMessage) {
    return this.chatModel.create(newMessage);
  }

  public async findRoomWithJoinedUsers(condition, projection?) {
    return this.roomModel.find({ joinedUsers: { $all: condition}}, projection);
  }
}