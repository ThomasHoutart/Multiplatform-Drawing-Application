import express from "express";
import { SaltService } from "../../SaltService";
import { UserController } from "../../../database/user/UserController";
import { HttpAuthenticatorService } from "./HttpAuthenticatorService";
import { HttpRoomService } from "./HttpRoomService";
import { HashService } from "../../HashService";
import { RoomController } from "../../../database/room/RoomController";
import { HttpWordImagePairService } from "./HttpWordImagePairService";
import { WordImagePairController } from "../../../database/wordImagePair/WordImagePairController";
import { HttpGameService } from "./HttpGameService";
import { GameService } from "../../Core/GameService";
import { SocketInterface } from "../Socket/SocketService";
import { UserService } from "../../Core/UserService";
import { KnownError } from "../../../errors/generic";
import { HttpProfileService } from "./HttpProfileService";
import { HttpLeaderboardService } from "./HttpLeaderBoardService";
import { GameController } from "../../../database/game/GameController";
import { HttpTrophyService } from "./HttpTrophyService";

export class HttpService<Socket extends SocketInterface> {
	public httpAuthenticatorService: HttpAuthenticatorService;
	public httpRoomService: HttpRoomService;
	public httpWordImagePairService: HttpWordImagePairService<Socket>;
	public httpGameService: HttpGameService;
	public httpProfileService: HttpProfileService;
	public httpLeaderboardService: HttpLeaderboardService;
	public httpTrophyService: HttpTrophyService;

	// eslint-disable-next-line max-lines-per-function
	constructor(
		public app: express.Express,
		public saltService: SaltService,
		public userController: UserController,
		public roomController: RoomController,
		public gameController: GameController,
		public wordImagePairController: WordImagePairController,
		public hashService: HashService,
		public gameService: GameService,
		public userService: UserService<Socket>,
	) {
		this.httpAuthenticatorService = new HttpAuthenticatorService(
			this.app,
			this.hashService,
			this.userController,
			this.roomController,
			this.saltService
		);
		this.httpRoomService = new HttpRoomService(this.app);
		this.httpGameService = new HttpGameService(this.app, this.gameService);
		this.httpWordImagePairService = new HttpWordImagePairService(
			this.app,
			this.wordImagePairController,
			this.userService,
		);
		this.httpProfileService = new HttpProfileService(this.app, this.userController);
		this.httpLeaderboardService = new HttpLeaderboardService(this.app, this.gameController);
		this.httpTrophyService = new HttpTrophyService(this.app, this.userController);
	}

	public init(): void {
		this.httpAuthenticatorService.init();
		this.httpRoomService.init();
		this.httpWordImagePairService.init();
		this.httpGameService.init();
		this.httpLeaderboardService.init();
		this.httpProfileService.init();
		this.httpTrophyService.init()
	}

	// eslint-disable-next-line max-lines-per-function
	public dummyRequests(): void {
		// eslint-disable-next-line max-lines-per-function
		this.app.get('/profile/user/', (request, response) => {
			try {
				// const id = request.query.hashSocketId as string;
				// const username = this.userService.getUsernameBySocketHash(id);
				const connections = [];
				for (let i = 0; i < 193; ++i) {
					const randMins1 = Math.random() * 120 - 60
					const randMins2 = Math.random() * 120 + randMins1
					const d1 = new Date();
					const d2 = new Date();
					d1.setTime(d1.getTime() + 60000 * randMins1);
					d2.setTime(d1.getTime() + 60000 * randMins2);
					d1.setTime(d1.getTime() + i * 24 * 60 * 60000);
					d2.setTime(d2.getTime() + i * 24 * 60 * 60000);
					connections.push(
						{on: d1.toString(), off: d2.toString()}
					)
				}
				response.status(200).json({
					nGamesPlayed: 1231,
					nWins: 644,
					nLosses: 1231-644,
					totalGameTimeMinutes: 1231 * 2.55,
					totalTimeMinutes: 12345,
					connections,
					FFA: {
						Easy: [
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 10000 },
									{ username: "Antoine", avatar: 4, score: 0 },
									{ username: "Simon", avatar: 6, score: 0 },
								]
							},
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 1337 },
									{ username: "Antoine", avatar: 4, score: 420 },
									{ username: "Simon", avatar: 6, score: 69 },
								]
							},
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 10000 },
									{ username: "Antoine", avatar: 4, score: 0 },
									{ username: "Simon", avatar: 6, score: 0 },
								]
							},
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 1337 },
									{ username: "Antoine", avatar: 4, score: 420 },
									{ username: "Simon", avatar: 6, score: 69 },
								]
							},
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 10000 },
									{ username: "Antoine", avatar: 4, score: 0 },
									{ username: "Simon", avatar: 6, score: 0 },
								]
							},
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 1337 },
									{ username: "Antoine", avatar: 4, score: 420 },
									{ username: "Simon", avatar: 6, score: 69 },
								]
							},
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 10000 },
									{ username: "Antoine", avatar: 4, score: 0 },
									{ username: "Simon", avatar: 6, score: 0 },
								]
							},
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 1337 },
									{ username: "Antoine", avatar: 4, score: 420 },
									{ username: "Simon", avatar: 6, score: 69 },
								]
							},
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 10000 },
									{ username: "Antoine", avatar: 4, score: 0 },
									{ username: "Simon", avatar: 6, score: 0 },
								]
							},
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 1337 },
									{ username: "Antoine", avatar: 4, score: 420 },
									{ username: "Simon", avatar: 6, score: 69 },
								]
							},
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 10000 },
									{ username: "Antoine", avatar: 4, score: 0 },
									{ username: "Simon", avatar: 6, score: 0 },
								]
							},
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 1337 },
									{ username: "Antoine", avatar: 4, score: 420 },
									{ username: "Simon", avatar: 6, score: 69 },
								]
							},
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 10000 },
									{ username: "Antoine", avatar: 4, score: 0 },
									{ username: "Simon", avatar: 6, score: 0 },
								]
							},
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 1337 },
									{ username: "Antoine", avatar: 4, score: 420 },
									{ username: "Simon", avatar: 6, score: 69 },
								]
							},
						],
						Normal: [
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 10000 },
									{ username: "Antoine", avatar: 4, score: 0 },
									{ username: "Simon", avatar: 6, score: 0 },
								]
							},
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 1337 },
									{ username: "Antoine", avatar: 4, score: 420 },
									{ username: "Simon", avatar: 6, score: 69 },
								]
							},],
						Hard: [
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 10000 },
									{ username: "Antoine", avatar: 4, score: 0 },
									{ username: "Simon", avatar: 6, score: 0 },
								]
							},
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 1337 },
									{ username: "Antoine", avatar: 4, score: 420 },
									{ username: "Simon", avatar: 6, score: 69 },
								]
							},],
					},
					BR: {
						Easy: [
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 10000 },
									{ username: "Antoine", avatar: 4, score: 0 },
									{ username: "Simon", avatar: 6, score: 0 },
								]
							},
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 1337 },
									{ username: "Antoine", avatar: 4, score: 420 },
									{ username: "Simon", avatar: 6, score: 69 },
								]
							},
						],
						Normal: [
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 10000 },
									{ username: "Antoine", avatar: 4, score: 0 },
									{ username: "Simon", avatar: 6, score: 0 },
								]
							},
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 1337 },
									{ username: "Antoine", avatar: 4, score: 420 },
									{ username: "Simon", avatar: 6, score: 69 },
								]
							},
						],
						Hard: [
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", avatar: 2, score: 10000 },
									{ username: "Antoine", avatar: 4, score: 0 },
									{ username: "Simon", avatar: 6, score: 0 },
								]
							},
							{
								time: Date.now(),
								scores: [
									{ username: "Bruno", score: 1337 },
									{ username: "Antoine", score: 420 },
									{ username: "Simon", score: 69 },
								]
							},
						],
					}
				});
			} catch (e) {
				if (e instanceof KnownError) {
					response.sendStatus(400);
				} else {
					response.sendStatus(500);
				}
			}
		});
		this.app.get('/profile/achievement/', (request, response) => {
			try {
				// const id = request.query.hashSocketId as string;
				// const username = this.userService.getUsernameBySocketHash(id);
				response.status(200).json({
					trophies: [
						{ rank: "Bronze", trophy: "win1Game" }, 
						{ rank: "Silver", trophy: "play10Games" },
						{ rank: "Gold",   trophy: "play100Games" },
					]
				});
			} catch (e) {
				if (e instanceof KnownError) {
					response.sendStatus(400);
				} else {
					response.sendStatus(500);
				}
			}
		});
		this.app.get('/AllAchievements/', (request, response) => {
			try {
				response.status(200).json({
					trophies: [
						{ rank: "Bronze", trophy: "win1Game" }, 
						{ rank: "Silver", trophy: "play10Games" },
						{ rank: "Gold",   trophy: "play100Games" },
						{ rank: "Silver", trophy: "win10Games" }, 
						{ rank: "Bronze", trophy: "play1Games" },
						{ rank: "Gold",   trophy: "win100Games" }
					]
				});
			} catch (e) {
				if (e instanceof KnownError) {
					response.sendStatus(400);
				} else {
					response.sendStatus(500);
				}
			}
		});
		// eslint-disable-next-line max-lines-per-function
		this.app.get('/leaderboard/', (request, response) => {
			try {
				// const id = request.query.hashSocketId as string;
				// const username = this.userService.getUsernameBySocketHash(id);
				response.status(200).json({
					players: [
						{
							username: "Vincent",
							avatar: 1,
							nbOfGameWon: 51
						},
						{
							username: "Sophie",
							avatar: 3,
							nbOfGameWon: 42
						},
					]
				});
			} catch (e) {
				if (e instanceof KnownError) {
					response.sendStatus(400);
				} else {
					response.sendStatus(500);
				}
			}
		});
	}
}
