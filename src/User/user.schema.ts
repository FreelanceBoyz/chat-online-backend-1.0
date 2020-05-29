import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import * as mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  phone: String,
  rooms: [mongoose.Schema.Types.ObjectId],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

function comparePassword(candidatePassword: string): Promise<boolean> {
  const candidatePasswordsha256 = crypto
    .createHash("sha256")
    .update(candidatePassword)
    .digest("hex");
  return bcrypt
    .compare(`${candidatePasswordsha256}`, this.password)
    .catch(() => {
      throw { err: "Error validating password" };
    });
}

UserSchema.methods.comparePassword = comparePassword;
UserSchema.index({ email: 1 });

export { UserSchema };
