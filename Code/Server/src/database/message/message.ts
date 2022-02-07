import mongoose, { Schema, Document } from 'mongoose';
import { ChatMessageToSend } from '../../types/message';

export interface DBMessage extends Document, ChatMessageToSend {}

const MessageSchema: Schema = new Schema(
    {
        roomName: { type: String, required: true, index: true },
        timestamp: { type: Date, required: true, index: true },
        author: { type: String, required: true, index: true },
        content: { type: String, required: true },
        avatar: { type: Number, required: true },
    },
    { collection: 'Message', toObject: { versionKey: false, virtuals: false } }
);

const MessageModel = mongoose.model<DBMessage>('Message', MessageSchema);
export default MessageModel;
