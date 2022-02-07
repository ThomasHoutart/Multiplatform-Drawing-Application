import { GameDoesNotExistError } from "../../errors/game";
import { List } from "../../List";
import {
	DateFilter,
	EMPTY_LEADERBOARD,
	GameInfo,
	GameType,
	LeaderBoards,
	UsernameScoreAvatar,
} from "../../types/game";
import { GameModeInfo, Trophy } from "../../types/user";
import { Difficulty } from "../../types/game";
import { DatabaseController } from "../DatabaseController";
import GameModel, { DBGame } from "./game";
import UserModel, { DBUser } from "../user/user";
import { UserDoesNotExistError } from "../../errors/user";
import { N_GAMES_TROPHIES } from "../../statistics/Statistics";
import { UserTrophyEvent } from "../../events/userEvents";

export class GameController {
	constructor(public db: DatabaseController) {}

	get = async (lobbyName: string): Promise<GameInfo> => {
		const document = await GameModel.findOne({ name: lobbyName }, "-_id");
		if (!document) throw new GameDoesNotExistError();
		const gameInfo = this.formatDocument(document);
		return gameInfo;
	};

	getGamesByIDs = async (ids: string[]): Promise<List<GameInfo>> => {
		const games = await GameModel.find({ _id: { $in: ids } }, "-_id").sort(
			"timestamp"
		);
		if (!games) throw new Error();
		return this.formatDocuments(games);
	};

	getDateFromFilter(dateRestriction: DateFilter): Date {
		let offset = 0;
		switch (dateRestriction) {
			case DateFilter.Day:
				offset = 1;
				break;
			case DateFilter.Week:
				offset = 7;
				break;
			case DateFilter.Total:
				offset = 365;
				break;
		}
		const today = new Date();
		return new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate() - offset,
			today.getHours(),
			today.getMinutes()
		);
	}

	getLeaderboards = async (): Promise<any> => {
		const documents = await GameModel.find({}, "-_id");
		if (!documents)
			throw new GameDoesNotExistError();
		const games = this.formatDocuments(documents);
		const leaderboard: LeaderBoards = EMPTY_LEADERBOARD;
		for (const gameType in GameType) {
			for (const difficulty in Difficulty) {
				for (const dateFilter in DateFilter) {
					const filteredGames = await this.filter(
						games,
						GameType[gameType],
						Difficulty[difficulty],
						DateFilter[dateFilter],
					);
					leaderboard[gameType][difficulty][dateFilter] = (
						await this.getLeaderboardFromGames(filteredGames)
					).getArray();
				}
			}
		}
		return leaderboard as LeaderBoards;
	};

	// eslint-disable-next-line max-lines-per-function
	async getLeaderboardFromGames(games: List<GameInfo>) {
		const leaderboard = new Map<string, number>();
		const avatarsByuser = new Map<string, number>();
		await games.foreach(async (game: GameInfo) => {
			if (!game.score || !game.totalTime)
				throw new Error();

			const topScore = game.score
				.getArray()
				.reduce((prev, current) =>
					prev.score > current.score ? prev : current
				).score;

			// eslint-disable-next-line require-await
			await game.score.foreach(async (user: UsernameScoreAvatar) => {
				if (!leaderboard.has(user.username)) {
					leaderboard.set(user.username, 0);
					avatarsByuser.set(user.username, user.avatar);
				}
				if (user.score == topScore) {
					const previousScore = leaderboard.get(user.username);
					if (previousScore == undefined)
						throw new Error();
					leaderboard.set(user.username, previousScore + 1);
				}
			});
		});
		const ldrbrdList = new List(
			Array.from(leaderboard, ([name, value]) => ({
				username: name,
				nWins: value,
				avatar: avatarsByuser.get(name),
			}))
		);
		ldrbrdList.sort((a: any, b: any) => {
			return a.nWins - b.nWins;
		});
		return ldrbrdList;
	}

	formatDocuments = (games: DBGame[]) => {
		const formattedGameList = new List<GameInfo>([]);
		games.forEach((game: DBGame) => {
			const formattedGame = this.formatDocument(game);
			formattedGameList.push(formattedGame);
		});
		return formattedGameList;
	};

	formatDocument = (document: DBGame) => {
		const formattedScoreList = new List<UsernameScoreAvatar>([]);
		const gameInfo = this.db.documentToObject(document);
		if (!gameInfo) throw new Error();
		gameInfo.score.forEach((points: any) => {
			formattedScoreList.push({
				score: points.score,
				username: points.username,
				avatar: points.avatar,
			});
		});
		gameInfo.score = formattedScoreList;
		gameInfo.timestamp = new Date(gameInfo.timestamp);
		return gameInfo;
	};

	async filter(
		games: List<GameInfo>,
		gameType: GameType,
		difficulty: Difficulty,
		dateFilter: DateFilter
	): Promise<List<GameInfo>> {
		const date = this.getDateFromFilter(dateFilter);
		return await games.reduce((game: GameInfo) => {
			return (
				game.gameType == gameType &&
				game.difficulty == difficulty &&
				game.timestamp.getTime() > date.getTime()
			);
		});
	}

	// eslint-disable-next-line max-lines-per-function
	async filterGameType(
		games: List<GameInfo>,
		gameType: GameType
	): Promise<GameModeInfo> {
		return {
			Easy: (
				await this.filter(
					games,
					gameType,
					Difficulty.Easy,
					DateFilter.Total
				)
			).getArray(),
			Normal: (
				await this.filter(
					games,
					gameType,
					Difficulty.Normal,
					DateFilter.Total
				)
			).getArray(),
			Hard: (
				await this.filter(
					games,
					gameType,
					Difficulty.Hard,
					DateFilter.Total
				)
			).getArray(),
		};
	}

	add = async (game: GameInfo): Promise<void> => {
		const document = new GameModel({
			...game,
			score: game.score.getArray(),
		});
		const saved = await document.save();
		if (!saved) throw new Error();
		await this.addGameToUser(saved);
	};

	clear = async (): Promise<void> => {
		if (!(await GameModel.deleteMany({}))) throw new Error();
	};

	addGameToUser = async (game: DBGame): Promise<void> => {
		if (!game.score || !game.totalTime) throw new Error();
		const topScore = game.score.reduce((prev, current) =>
			prev.score > current.score ? prev : current
		).score;
		for (const value of game.score) {
			const username = value.username;
			const isWin = value.score == topScore ? 1 : 0;
			if (!username.startsWith("bot")) {
				const user = await UserModel.findOneAndUpdate(
					{ username },
					{
						$push: { games_id: game._id },
						$inc: {
							gamesWon: isWin,
							gamesLost: 1 - isWin,
							gameTime: Math.round(game.totalTime / 1000),
						},
					},{new: true}
				);
				if (!user) throw new UserDoesNotExistError();
				else await this.verifyTrophies(user);
			}
		}
	};

	// eslint-disable-next-line max-lines-per-function
	public async verifyTrophies(user: DBUser): Promise<void> {
		if (
			user.gamesLost == undefined ||
			user.gamesWon == undefined ||
			user.username == undefined
		)
			throw new Error();
		const gametime = user.gameTime
		const trophies = user.trophies
		if (gametime == undefined || trophies==undefined) throw new Error()
		const gamesPlayed = user.gamesWon + user.gamesLost;
		await N_GAMES_TROPHIES.forEach(async (n: number) => {
			if (n == gamesPlayed && !trophies.includes(`play${n}Game`)) {
				await new UserTrophyEvent(
					Trophy[`play${n}Game`],
					user.username
				).emit();
			}
			if (n == user.gamesWon && !trophies.includes(`win${n}Game`)) {
				await new UserTrophyEvent(
					Trophy[`win${n}Game`],
					user.username
				).emit();
			}
			if (n < gametime / 60 && ! trophies.includes(`play${n}Minute`)) {
				await new UserTrophyEvent(
					Trophy[`play${n}Minute`],
					user.username
				).emit();
			}
		});
	}
}
