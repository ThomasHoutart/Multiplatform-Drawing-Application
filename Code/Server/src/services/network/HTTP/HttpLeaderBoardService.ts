import express from "express";
import { GameController } from "../../../database/game/GameController";

export class HttpLeaderboardService {
	constructor(
		private app: express.Express,
		private gameController: GameController
	) {}

	public init(): void {
		this.requestLeaderBoard();
	}

	private requestLeaderBoard() {
		this.app.get("/leaderboard/", async (request, response) => {
			await this.doRequestLeaderBoard(request, response);
		});
	}

	private doRequestLeaderBoard = async (request: any, response: any) => {
		try {
			const leaderBoard = await this.gameController.getLeaderboards();
			response.status(200).json(leaderBoard);
		} catch (e) {
			(console).log(e);
			response.sendStatus(500);
		}
	};
}
