import WordImagePairModel from "./wordImagePair";
import { DatabaseController } from "../DatabaseController";
import { WordImagePair } from "../../types/wordImagePair";
import { LocalDrawingPaser } from "./LocalDrawingsParser";
import { Drawing } from "../../virtualPlayer/virtualPlayer";
import { List } from "../../List";

export class WordImagePairController {
	constructor(public db: DatabaseController) {}

	private static instance: WordImagePairController;
    public static getInstance(db?: DatabaseController): WordImagePairController {
		if (!WordImagePairController.instance && db)
            WordImagePairController.instance = new WordImagePairController(db);
        return WordImagePairController.instance;
	}
	public static setInstance(db: DatabaseController) {
		WordImagePairController.instance = new WordImagePairController(db);
	}

	async init() {
		if ((await WordImagePairModel.count({})) === 0) {
			const drawings = new LocalDrawingPaser().fetchLocalDrawings();
			await drawings.foreach(async (drawing: Drawing) => {
				await this.addDrawing(drawing);
			});
		}
	}

	get = async (word: string): Promise<List<WordImagePair>> => {
		const document = await WordImagePairModel.find({ word });
		if (!document)
			throw new Error();
		return this.db.documentArrayToList(document);
	};

	getWords = async (difficulty: string): Promise<List<string>> => {
		const documents = await WordImagePairModel.find({ difficulty }, "-_id").select({ word: 1 });
		if (!documents)
			throw new Error();
		const docList = new List<any>([]);
		documents.forEach((doc) => {
			if (!docList.has(doc.word))
				docList.push(doc.toObject().word);
		});
		if (docList.length() == 0)
			throw new Error("No words in DB");
		docList.shuffle();
		return docList;
	};

	getHintsByWord = async (word: string): Promise<List<string>> => {
		const documents = await WordImagePairModel.find({ word }, "-_id").select({ hints: 1 });
		if (!documents) throw new Error();
		const docList = new List<any>([]);
		documents.forEach((doc) => {
			docList.push(new List(JSON.parse(doc.toObject().hints)));
		});
		if (docList.length() == 0)
			throw new Error("No hints in DB");
		docList.shuffle();
		return docList.get(0);
	};

	getDrawing = async (word: string): Promise<Drawing> => {
		const WIP = await this.get(word);
		const drawings = new List<Drawing>();
		// eslint-disable-next-line require-await
		await WIP.foreach(async (wip: WordImagePair) => {
			drawings.push({
				artist: wip.artist,
				word: wip.word,
				canvasSize: wip.canvasSize,
				difficulty: wip.difficulty,
				hints: new List(JSON.parse(wip.hints)),
				paths: new List(JSON.parse(wip.paths)),
			});
		});
		drawings.shuffle();
		return drawings.get(0);
	};

	addDrawing = async (drawing: Drawing): Promise<void> => {
		const WIP: WordImagePair = {
			artist: drawing.artist,
			word: drawing.word.toLowerCase(),
			canvasSize: drawing.canvasSize,
			difficulty: drawing.difficulty,
			hints: JSON.stringify(drawing.hints.getArray()),
			paths: JSON.stringify(drawing.paths.getArray()),
		};
		await this.add(WIP);
	};

	add = async (pair: WordImagePair): Promise<void> => {
		const document = new WordImagePairModel(pair);
		const saved = await document.save();
		if (!saved) throw new Error();
	};

	clear = async (): Promise<void> => {
		if (!(await WordImagePairModel.deleteMany({}))) throw new Error();
	};
}
