import mongoose, { Schema, Document } from 'mongoose';
import { RoomQuery } from '../../types/message';

export interface DBRoom extends Document, RoomQuery {}

const RoomSchema: Schema = new Schema(
    {
        roomName: { type: String, required: true, index: true, unique: true },
        users_id: [{type: Schema.Types.ObjectId, ref: 'User'}],
        messages_id: [{type: Schema.Types.ObjectId, ref: 'Message'}],    
        creator: { type: String, required: true, unique: false },
    },
    { collection: 'Room', toObject: { versionKey: false, virtuals: false } },
);

const RoomModel = mongoose.model<DBRoom>('Room', RoomSchema);
export default RoomModel;
