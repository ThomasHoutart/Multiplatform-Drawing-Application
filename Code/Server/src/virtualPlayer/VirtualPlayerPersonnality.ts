import { List } from "../List";
import { Trophy } from "../types/user";

const NUMBER_AVATARS = 12

export enum Situation {
	WinStreak = "WinStreak",
	LossStreak = "LossStreak",
	RoundStart = "RoundStart",
}

export abstract class VirtualPlayerPersonality {
	public name: string;
	public avatar: number;

	constructor() {
		this.name = this.setName();
		if (!this.name.startsWith("bot_"))
			throw new Error("Invalid virt user name");
		this.avatar = (this.name.length - 4) % NUMBER_AVATARS;
	}

	abstract setName(): string;
	abstract comment(username: string): Promise<string>;

	randomNumber(max: number): number {
		return Math.floor(Math.random() * max);
	}
}

export abstract class VirtualPlayerBot extends VirtualPlayerPersonality {
	constructor() {
		super()
	}
	abstract commentName(username:string):string;
	abstract commmentGames(username:string, nWin: number, nLoss: number): string;
	abstract commentTime(username: string, logTime: number, gameTime: number): string;
	abstract commentTrophies(username: string, trophies: List<Trophy>): string;
}
