import { ObjectId } from "mongodb";
import { Document } from "mongoose";

export interface Room extends Document {
  _id: ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomPermission extends Document {
  _id: ObjectId;
  roomId: ObjectId;
  refId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chat extends Document {
  _id: ObjectId;
  ownerId: ObjectId;
  room: ObjectId;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}