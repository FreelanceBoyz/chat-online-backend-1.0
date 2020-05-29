import { ObjectId } from "mongodb";
import { Document } from "mongoose";

export interface User extends Document {
  _id: ObjectId;
  email: string;
  password: string;
  name: string;
  rooms: [ObjectId]
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}