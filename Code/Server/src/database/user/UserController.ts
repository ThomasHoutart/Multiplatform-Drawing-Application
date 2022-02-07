import {
	EmailExistsError,
	UserDoesNotExistError,
	UsernameExistsError,
} from "../../errors/user";
import { List } from "../../List";
import { GameInfo, GameType } from "../../types/game";
import { ClientUser, Connection, Trophy, UserInfo } from "../../types/user";
import { LoginCredential } from "../../types/user";
import { DatabaseController } from "../DatabaseController";
import { GameController } from "../game/GameController";
import UserModel, { DBUser } from "./user";

export class UserController {
	
	private static instance: UserController;
    public static getInstance(db?: DatabaseController, gameController?: GameController): UserController {
		if (!UserController.instance && db && gameController)
            UserController.instance = new UserController(db, gameController);
        return UserController.instance;
	}
	public static setInstance(db: DatabaseController, gameController: GameController) {
		UserController.instance = new UserController(db, gameController);
	}

	constructor(
		public db: DatabaseController,
		public gameController: GameController
	) {}

	get = async (username: string): Promise<UserInfo> => {
		const document = await UserModel.findOne({ username: username });
		if (!document) throw new UserDoesNotExistError();
		return this.formatDocument(document);
	};

	formatDocument = (document: DBUser) => {
		const formattedConnectionList = new List<Connection>([]);
		const fromattedTrophyList = new List<Trophy>([]);
		const userInfo = this.db.documentToObject(document);
		if (!userInfo) throw new Error();
		userInfo.connections.forEach((connection: Connection) => {
			formattedConnectionList.push({
				login: connection.login,
				logout: connection.logout,
			});
		});
		userInfo.trophies.forEach((trophy: Trophy) => {
			fromattedTrophyList.push(Trophy[trophy]);
		});
		userInfo.connections = formattedConnectionList;
		userInfo.trophies = fromattedTrophyList;
		return userInfo;
	};

	add = async (credentials: ClientUser): Promise<void> => {
		const user = new UserModel(credentials);
		const saved = await user.save();
		if (!saved) throw new Error();
	};

	addConnection = async (
		username: string,
		connection: Connection
	): Promise<void> => {
		await UserModel.findOneAndUpdate(
			{ username },
			{
				$push: {
					connections: {
						login: connection.login,
						logout: connection.logout,
					},
				},
				$inc: {
					loggedTime: Math.round(
						(connection.logout.getTime() -
							connection.login.getTime()) /
							1000
					),
				},
			},{new: true}
		);
	};

	// eslint-disable-next-line max-lines-per-function
	getUserProfile = async (username: string): Promise<any> => {
		const user = await this.get(username);
		const connections = user.connections
			? await UserController.connectionListToSend(user.connections)
			: [];
		let FFA: any = { Easy: [], Normal: [], Hard: [] };
		let BR: any = { Easy: [], Normal: [], Hard: [] };
		if (user.games_id) {
			const games = await this.gameController.getGamesByIDs(
				user.games_id
			);
			FFA = await this.gameController.filterGameType(
				games,
				GameType.FFA
			);
			FFA = {
				Easy: await UserController.gameModeInfoToSend(FFA.Easy),
				Normal: await UserController.gameModeInfoToSend(FFA.Normal),
				Hard: await UserController.gameModeInfoToSend(FFA.Hard),
			};
			BR = await this.gameController.filterGameType(
				games,
				GameType.BR
			);
			BR = {
				Easy: await UserController.gameModeInfoToSend(BR.Easy),
				Normal: await UserController.gameModeInfoToSend(BR.Normal),
				Hard: await UserController.gameModeInfoToSend(BR.Hard),
			};
		}
		const profile: any = {
			nWins: user.gamesWon,
			nLosses: user.gamesLost,
			totalGameTimeMinutes: user.gameTime,
			totalTimeMinutes: user.loggedTime,
			connections: connections,
			FFA: FFA,
			BR: BR,
		};
		return profile;
	};

	static gameModeInfoToSend(game: GameInfo[]) {
		const send: any = [];
		game.forEach((game: GameInfo) => {
			send.push({
				name: game.name,
				timestamp: game.timestamp.toString(),
				totaltime: game.totalTime,
				score: game.score.getArray(),
				gameType: game.gameType.toString(),
				difficulty: game.difficulty.toString(),
			});
		});
		return send;
	}

	static connectionListToSend(connections: List<Connection>) {
		const send: any = [];
		// eslint-disable-next-line require-await
		connections.getArray().forEach(async (conn: Connection) => {
			send.push({
				login: conn.login.toString(),
				logout: conn.logout.toString(),
			});
		});
		return send;
	}

	getUserTrophies = async (username: string): Promise<List<Trophy>> => {
		const user = await this.get(username);
		return user.trophies;
	};

	getGames = async (username: string): Promise<List<GameInfo>> => {
		const user = await this.get(username);
		return await this.gameController.getGamesByIDs(user.games_id);
	};

	clear = async (): Promise<void> => {
		if (!(await UserModel.deleteMany({}))) throw new Error();
	};

	credentialsExist = async (
		credentials: LoginCredential
	): Promise<boolean> => {
		const found = await UserModel.findOne({
			username: credentials.username,
			hash: credentials.hash,
		});
		return !!found;
	};

	update = async (email: string, changes: any): Promise<void> => {
		if (await this.userExists(changes.username))
			throw new UsernameExistsError();
		const added = await UserModel.findOneAndUpdate({ email }, changes);
		if (!added) throw new Error();
	};

	emailExists = async (email: string): Promise<boolean> => {
		const found = await UserModel.findOne({ email });
		return !!found;
	};

	userExists = async (username: string): Promise<boolean> => {
		const found = await UserModel.findOne({ username });
		return !!found;
	};

	public async assertNotUsedCredentials(
		username: string,
		email: string
	): Promise<void> {
		let exists = await this.userExists(username);
		if (exists) throw new UsernameExistsError();
		exists = await this.emailExists(email);
		if (exists) throw new EmailExistsError();
	}

	public async getHashForExistingUser(username: string): Promise<string> {
		const user = await this.get(username);
		const hash = user?.hash;
		if (!hash) throw new UserDoesNotExistError();
		return hash;
	}

	addTrophy = async (username: string, trophy: Trophy) => {
		const added = await UserModel.findOneAndUpdate(
			{ username },
			{ $push: { trophies: trophy } },{new: true}
		);
		if (!added || !added.trophies) throw new Error();
	};
}
