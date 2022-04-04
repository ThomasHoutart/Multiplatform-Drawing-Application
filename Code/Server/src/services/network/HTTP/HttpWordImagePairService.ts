import express from "express";
import { writeFileSync } from "fs";
import { WordImagePairController } from "../../../database/wordImagePair/WordImagePairController";
import { List } from "../../../List";
import { Difficulty } from "../../../types/game";
import { WordImagePair } from "../../../types/wordImagePair";
import { Coordinates, Path } from "../../../virtualPlayer/virtualPlayer";
import { UserService } from "../../Core/UserService";
import { SocketInterface } from "../Socket/SocketService";

export class HttpWordImagePairService<Socket extends SocketInterface> {
	constructor(
		private app: express.Express,
		public wordImagePairController: WordImagePairController,
		public userService: UserService<Socket>
	) {}

	public init(): void {
		this.requestPair();
	}

	private requestPair() {
		this.app.post("/wordImagePair/", async (request, response) => {
			await this.doRequestPair(request, response);
		});
	}

	private doRequestPair = async (request: any, response: any) => {
		try {
			const pair = this.createPairFromRequest(request);
			await this.storePair(pair);
			response.sendStatus(200);
		} catch (e) {
			(console).log(e);
			response.sendStatus(500);
		}
	};

	private createPairFromRequest(request: any): WordImagePair {
		const pair = {
			artist: request.body.username as string,
			word: request.body.word.toLowerCase() as string,
			canvasSize: request.body.canvasSize as number,
			paths: JSON.parse(request.body.paths),
			hints: JSON.parse(request.body.hints),
			difficulty: JSON.parse(request.body.difficulty) as Difficulty,
		} as WordImagePair;
		for (const key in pair) if (!pair[key]) throw new Error();
		return pair;
	}

	private async storePair(pair: WordImagePair, local = false): Promise<void> {
		local
			? writeFileSync(
					`./drawings/${pair.word}.json`,
					JSON.stringify({
						pair
					})
			)
			: await this.wordImagePairController.addDrawing(this.formatDrawing(pair));
	}

	formatDrawing(wip: any) {
		const parsedPaths = new List<Path>();
		wip.paths.forEach((element: any) =>
			parsedPaths.push(this.formatPath(element))
		);
		return {...wip, paths: parsedPaths, hints: new List(wip.hints)}
	}

	formatPath(path: any): Path {
		const coordinates = [] as Coordinates;
		const coords = path.path.split(" ");
		coords.pop();
		for (let i = 0; i < coords.length; i += 2) {
			coordinates.push({ x: coords[i], y: coords[i + 1] });
		}
		return {
			color: path.color.replace("#", "#FF"),
			strokeWidth: path.strokeWidth,
			canvasSize: path.canvasSize,
			coords: coordinates,
		};
	}
}
