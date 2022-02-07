import { WordImagePairController } from "../database/wordImagePair/WordImagePairController";
import { List } from "../List";

export abstract class Difficulty {
	async getWords(): Promise<List<string>> {
		return await WordImagePairController.getInstance().getWords(this.getName());
    }
    async getHintsByWord(word: string): Promise<List<string>> {
        return await WordImagePairController.getInstance().getHintsByWord(word)
    }
	abstract getTime(): number;
	abstract getName(): string;
	
}

export class Easy extends Difficulty {
	getTime(): number {
		return 60;
	}
	getName(): string {
		return "Easy";
	}
}

export class Normal extends Difficulty {
	getTime(): number {
		return 45;
	}
	getName(): string {
		return "Normal";
	}
}

export class Hard extends Difficulty {
	getTime(): number {
		return 30;
	}
	getName(): string {
		return "Hard";
	}
}
