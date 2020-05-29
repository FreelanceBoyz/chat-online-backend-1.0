import * as mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  message: String,
  ownerId: mongoose.Schema.Types.ObjectId,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ChatSchema.index({ room: 1 });

export { ChatSchema };
