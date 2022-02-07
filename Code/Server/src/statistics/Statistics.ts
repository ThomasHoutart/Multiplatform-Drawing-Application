import { GameController } from "../database/game/GameController";
import { UserController } from "../database/user/UserController";
import { UserDoesNotExistError } from "../errors/user";
import { EndGameToSendEvent } from "../events/gameEvents";
import { UserTrophyEvent } from "../events/userEvents";

export const N_GAMES_TROPHIES = [1, 10, 100];

export class Statistics {
	public loginDateByUsers: Map<string, Date>;

	constructor(
		public gameController: GameController,
		public userController: UserController
	) {
		this.loginDateByUsers = new Map<string, Date>();
		return;
	}

	async addTrophy(event: UserTrophyEvent) {
		await this.userController.addTrophy(event.username, event.trophy);
	}

	async endGame(event: EndGameToSendEvent) {
		const gameInfo = event.toGameInfo();
		await this.gameController.add(gameInfo);
		// TODO : gameType [BR, FFA] trophies
		// TODO : Update Ldrbrd
		// TODO : better error handling
	}

	login(username: string) {
		this.loginDateByUsers.set(username, new Date());
	}

	async logout(user: string) {
		const userLoginDate = this.loginDateByUsers.get(user);
		if (!userLoginDate) throw new UserDoesNotExistError();
		const userLogoutDate = new Date();
		this.loginDateByUsers.delete(user);
		await this.userController.addConnection(user, {
			login: userLoginDate,
			logout: userLogoutDate,
		});
	}
}
