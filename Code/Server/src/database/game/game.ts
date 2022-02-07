import mongoose, { Schema, Document } from "mongoose";
import { GameQuery } from "../../types/game";

export interface DBGame extends GameQuery, Document {}

const GameSchema: Schema = new Schema(
	{
		name: { type: String, required: true },
		totalTime: { type: Number, required: true },
		timestamp: { type: Date, required: true },
		score: [
			{
				username: { type: String, required: true },
				score: { type: Number, required: true },
				avatar: { type: Number, required: true },
			},
		],
		gameType: {type: String, required: true, index: true},
		difficulty: {type: String, required: true, index: true},
	},
	{ collection: "Game", toObject: { versionKey: false, virtuals: false } }
);

const GameModel = mongoose.model<DBGame>("Game", GameSchema);
export default GameModel;
