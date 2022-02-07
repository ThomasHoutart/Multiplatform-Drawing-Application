import { UserController } from "../../database/user/UserController";
import { List } from "../../List";
import { Trophy } from "../../types/user";
import {
	VirtualPlayerBot,
} from "../VirtualPlayerPersonnality";

const NAME_OPTIONS = ["Karen", "WorkOutKaren", "KarenLuv", "KarenMLM"];
const NAME_COMMENTS = [
	"PLACEHOLDER, dont't you think this game is so, fuuUUuuUUuUuUUuuuuUUUuun  🥳 🥳",
	"PLACEHOLDER :), are you interested in hearing about my 💄💍 Avon💸 💍💄 cosmetic products??",
	"you know PLACEHOLDER, I just love your style 🥰. Go check out my IG @basicKaren",
]

export class VirtualKaren extends VirtualPlayerBot {
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
		if (nWin == undefined || nLoss == undefined) throw new Error()
		if (nWin == 0 && nLoss == 0) {
			return `wtf apparently ${user} is a newb who's never played? 🤢 🤮🤢 🤮`
		} else if (nWin == 0) {
			return `Wow, ${user} never won a game... gross`
		} else if (nLoss == 0) {
			`${user} never lost a game 😍😍 clearly my type `
		}
		if (nWin > nLoss) {
			return `OMG ${user} your're like, my IIIIDDDOOOLLLL 💪 lol. ${nWin} WINSS??? ${nLoss} LOSSES??? just like me you can't stop winning 😍😍`
		} if (nWin < nLoss) {
			return `${user} you're 🗑️. ${nWin}-${nLoss} win-lose? WTF 🤢 🤮`
		} else if (nWin == nLoss) {
			return `${user}, a ${nWin}-${nLoss}? at least try to get more W's than L's.`
		} else {
			return "ugh, I need new friends"
		}
	}
	commentTime(user:string,  logTime: number, gameTime: number): string {
		if (logTime == 0) {
			return `${user}, first login? gotta spend some more time to get good`
		} else if (logTime / 60 < 60) {
			return `${user}, ${logTime/60} minutes playing this game? gotta spend some more time to get good`
		} else {
			return `${user} played ${gameTime/60} minutes, wat a champ 💪💪💪`
		}
	}
	commentTrophies(user: string, trophies: List<Trophy>): string {
		return `${user}, just ${trophies.length()} trophies? get on my LEVELLL 💪💸💸`
	}
}
