import * as mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  title: String,
  joinedUsers: [mongoose.Schema.Types.ObjectId],
  messages: [mongoose.Schema.Types.ObjectId],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export { RoomSchema };
