import express from "express";
import { UserController } from "../../../database/user/UserController";

export class HttpTrophyService {
	constructor(
		private app: express.Express,
		private userController: UserController
	) {}

	public init(): void {
		this.requestTrophies();
	}

	private requestTrophies() {
		this.app.get("/achievement/", async (request, response) => {
			await this.doRequestTrophies(request, response);
		});
	}

	private doRequestTrophies = async (request: any, response: any) => {
		try {
			const unlockedTrophies = await this.userController.getUserTrophies(
				request.query.username
			);
			const ans = [];
			for (let i = 0; i < ACHIEVEMENTS.length; i++) {
				const isTrophyUnlocked = unlockedTrophies.find(
					(element) => element == ACHIEVEMENTS[i].trophy
				);
				const trophy = { rank: ACHIEVEMENTS[i].rank, trophy: ACHIEVEMENTS[i].title, hint: ACHIEVEMENTS[i].hint }
				isTrophyUnlocked ?
					ans.push({...trophy, isUnlocked: true }):
					ans.push({ ...trophy, isUnlocked: false });
			}
			response.status(200).json(ans);
		} catch (e) {
			(console).log(e);
			response.sendStatus(500);
		}
	};
}

const ACHIEVEMENTS = [
	{ rank: "Bronze", trophy: "play1Game", hint: "Play 1 Game", title:"New Beginnings" },
	{ rank: "Silver", trophy: "play10Game", hint: "Play 10 Games", title:"Participation Award" },
	{ rank: "Gold", trophy: "play100Game", hint: "Play 100 Games", title:"Bigger Participation Award" },
	{ rank: "Bronze", trophy: "win1Game", hint: "Win 1 Game", title:"PogChamp" },
	{ rank: "Silver", trophy: "win10Game", hint: "Win 10 Games", title:"Try Hard" },
	{ rank: "Gold", trophy: "win100Game", hint: "Win 100 Games", title:"Get a Life" },
	{ rank: "Bronze", trophy: "play1Minute", hint: "play 1 Minutes", title:"A New Addiction" },
	{ rank: "Silver", trophy: "play10Minute", hint: "play 10 Minutes", title:"The Downfall" },
	{ rank: "Gold", trophy: "play100Minute", hint: "play 100 Minutes", title:"The bottom of the Pit" },
];
