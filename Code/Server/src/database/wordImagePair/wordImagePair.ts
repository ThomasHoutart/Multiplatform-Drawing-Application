import mongoose, { Schema, Document } from "mongoose";
import { WordImagePairQuery } from "../../types/wordImagePair";

export interface DBWordImagePair extends WordImagePairQuery, Document {}

const WordImagePairSchema: Schema = new Schema(
	{
		artist: { type: String },
		word: { type: String },
		canvasSize: { type: Number },
		paths: { type: String },
		hints: { type: String },
		difficulty: { type: String },
	},
	{
		collection: "WordImagePair",
		toObject: { versionKey: false, virtuals: false },
	}
);

const WordImagePairModel = mongoose.model<DBWordImagePair>(
	"WordImagePair",
	WordImagePairSchema
);
export default WordImagePairModel;
