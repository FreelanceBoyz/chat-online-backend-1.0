import { ObjectId } from "mongodb";
import { Document } from "mongoose";

export interface Room extends Document {
  _id: ObjectId;
  title: string;
  joinedUsers: [string];
  messages: [string];
  createdAt: Date;
  updatedAt: Date;
}

export interface Chat extends Document {
  _id: ObjectId;
  ownerId: ObjectId;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}