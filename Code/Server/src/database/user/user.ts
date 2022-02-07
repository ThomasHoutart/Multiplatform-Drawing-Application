import mongoose, { Schema, Document } from "mongoose";
import { UserQuery } from "../../types/user";

export interface DBUser extends UserQuery, Document {}

const UserSchema: Schema = new Schema(
	{
		username: { type: String, unique: true },
		firstName: { type: String },
		lastName: { type: String },
		email: { type: String, index: true, unique: true },
		hash: { type: String },
		salt: { type: String },
		avatar: { type: Number, default: 0 },
        gamesWon: { type: Number, default: 0 },
		gamesLost: { type: Number, default: 0 },
		gameTime: { type: Number, default: 0 },
		loggedTime: { type: Number, default: 0 },
		games_id: [{ type: Schema.Types.ObjectId, ref: "Game" }],
		connections: [
			{
				login: { type: Date },
				logout: { type: Date },
			},
		],
		trophies: [{ type: String }],
	},
	{ collection: "User", toObject: { versionKey: false, virtuals: false } }
);

const UserModel = mongoose.model<DBUser>("User", UserSchema);
export default UserModel;
