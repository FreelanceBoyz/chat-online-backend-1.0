import * as mongoose from "mongoose";

const RoomPermissionSchema = new mongoose.Schema({
  roomId: mongoose.Schema.Types.ObjectId,
  refId: mongoose.Schema.Types.ObjectId,
  role: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

RoomPermissionSchema.index({ roomId: 1, refId: 1 });

export {  RoomPermissionSchema };
