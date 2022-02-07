import { UserController } from "../../database/user/UserController";
import { List } from "../../List";
import { Trophy } from "../../types/user";
import { VirtualPlayerBot } from "../VirtualPlayerPersonnality";

const NAME_OPTIONS = ["Gendreau", "Julien", "Kevin"];
const NAME_COMMENTS = [
	"J'ai noté que j'allais être impressionné cette semaine",
	"Avez-vous vraiment mis un 'THICCCCeventListenerCauseEventIsTHIIIIIIC' dans le codebase?",
	"Vraiment mature comme thème les boys",
];

export class VirtualTA extends VirtualPlayerBot {
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
				return this.commentTime(userInfo.username,userInfo.loggedTime,userInfo.gameTime);
			case 2:
				return this.commentTrophies(userInfo.username,userInfo.trophies);
			case 3:
				return this.commmentGames(userInfo.username,userInfo.gamesWon,userInfo.gamesLost);
			default:
				throw new Error("Invalid random comment for virt user");
		}
	}

	commentName(username: string): string {
		return NAME_COMMENTS[this.randomNumber(NAME_COMMENTS.length)].replace(
			"PLACEHOLDER",
			username
		);
	}

	commmentGames(user: string, nWin: number, nLoss: number): string {
		if (nWin == 0 && nLoss == 0) {
			return `Première partie ${user}? Bonne chance avec le UI...`;
		} else if (nWin == 0) {
			return `${user}, il faut au minimum investir 1080 h dans DrawHub pour gagner sa première partie`;
		} else if (nLoss == 0) {
			`Aucune partie de perdue ${user}? Serait tu l'illustre Vincent Tessier par hasard?`;
		}
		if (nWin == undefined || nLoss == undefined) throw new Error();
		if (nWin > nLoss)
			return `${user} a ${nWin} wins et ${nLoss} loss. Clairement faisable en 1080 heures`;
		if (nWin <= nLoss)
			return `${user} a ${nWin} wins et ${nLoss} loss? Ça explique ton Jira timelog...`;
		else return "1080h/personne c'est raisonnable non?";
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	commentTime(user: string, logTime: number, gameTime: number): string {

		if (logTime == 0) {
			return `${user}, premier login? tu devrais passer plus de temps sur cette glorieuse app qui merite clairement A*`
		} else {
			return `${user} a seulement ${logTime/60} minutes sur DrawHub? Pourtant c'est clairement une app qui mérite un A*, messemble que 1080h serait un minimum!`
		}
	}

	commentTrophies(user: string, trophies: List<Trophy>): string {
		return `${user}, cmon ${trophies.length()} trophées? pas fort`;
	}
}
