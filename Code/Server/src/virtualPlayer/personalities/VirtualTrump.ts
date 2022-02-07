import { UserController } from "../../database/user/UserController";
import { List } from "../../List";
import { Trophy } from "../../types/user";
import { VirtualPlayerBot } from "../VirtualPlayerPersonnality";

const NAME_OPTIONS = ["TheRealTrump", "OrangeTrump", "POTUS"];
const NAME_COMMENTS = [
	"PLACEHOLDER, this game will be the best game EVER BUILT",
	"PLACEHOLDER, This was a 100% RIGGED GAME",
	"I tell you what PLACEHOLDER, I'm the most successful person ever to play this game, by far",
	"While PLACEHOLDER is an extremely unattractive person, I refuse to say that because I always insist on being politically correct"
]

export class VirtualTrump extends VirtualPlayerBot {
	userController: UserController;

	constructor() {
		super();
		this.userController = UserController.getInstance();
	}

	setName() {
		const randomName = this.randomNumber(NAME_OPTIONS.length);
		const randomSuffix = this.randomNumber(1000);
		const name = NAME_OPTIONS[randomName];
		return `bot_${name}${randomSuffix}`;
	}

	async comment(username: string): Promise<string> {
		const userInfo = await this.userController.get(username);
		const randomComment = this.randomNumber(4);
		switch (randomComment) {
			case 0:
				return this.commentName(userInfo.username);
			case 1:
				return this.commentTime(userInfo.username, userInfo.loggedTime, userInfo.gameTime);
			case 2:
				return this.commentTrophies(userInfo.username, userInfo.trophies);
			case 3:
				return this.commmentGames(userInfo.username, userInfo.gamesWon, userInfo.gamesLost);
			default:
				throw new Error("Invalid random comment for virt user");
		}
	}

	commentName(username: string): string {
		return NAME_COMMENTS[this.randomNumber(NAME_COMMENTS.length)].replace('PLACEHOLDER', username)
	}
	commmentGames(user: string, nWin: number, nLoss: number): string {
		if (nWin == 0 && nLoss == 0) {
			return `heard you have never won or played a game? pathetic...`
		} else if (nWin == 0) {
			return `heard you never won a game? pathetic...`
		} else if (nLoss == 0) {
			`heard you never lost a game? Prepare to experience something new...`
		}
		if (nWin > nLoss) {
			return `I think ${user} is just like me, a big, BIG winner. with ${nWin} wins and ${nLoss} losses, can't say otherwise`
		} if (nWin < nLoss) {
			return `${user} is PATHETIC, only ${nWin} wins and a big ${nLoss} losses? COME ON!!1!`
		} else if (nWin == nLoss) {
			return `${user}, a ${nWin}-${nLoss} winrate count is PATHETIC, you seriously got to win more.`
		} else {
			return "this game will be the greatest game EVER BUILT"
		}
	}
	commentTime(user:string,  logTime: number, gameTime: number): string {
		if (logTime == 0) {
			return `${user}, first connection? PATHETIC`
		} else if (logTime / 60 < 60) {
			return `${user}, ${logTime/60} minutes logged? try getting at least up to an hour! PATHETIC`
		} else if (gameTime / 60 < 60) {
			return `${user}, ${logTime/60} minutes ingame played? try getting at least up to an hour! PATHETIC`
		} else {
			return `${user}, I see you got ${gameTime/60} ingame minutes, you know those are rookie numbers right ...`
		}
	}
	commentTrophies(user: string, trophies: List<Trophy>): string {
		return `${user}, you have ${trophies.length()} trophies? PATHETIC`
	}
}
