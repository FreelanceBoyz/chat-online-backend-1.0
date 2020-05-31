import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';

const EmailVerifyToken = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export { EmailVerifyToken }
