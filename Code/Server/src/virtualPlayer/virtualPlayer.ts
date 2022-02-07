import { WordImagePairController } from "../database/wordImagePair/WordImagePairController";
import {
	AppendToPathReceivedEvent,
	SetPathReceivedEvent,
	WordToDrawToSendEvent,
} from "../events/gameEvents";
import { Difficulty } from "../game/Difficulty";
import { List } from "../List";
import { Sleeper } from "../services/Sleeper";
import { VirtualKaren } from "./personalities/VirtualKaren";
import { VirtualTA } from "./personalities/VirtualTA";
import { VirtualTrump } from "./personalities/VirtualTrump";
import {
	VirtualPlayerPersonality,
} from "./VirtualPlayerPersonnality";

export type xy = {
	x: number;
	y: number;
};

export type Coordinates = xy[];

export type Drawing = {
	artist: string;
	word: string;
	canvasSize: number;
	paths: List<Path>;
	hints: List<string>;
	difficulty: string;
};

export type Path = {
	strokeWidth: number;
	color: string;
	canvasSize: number;
	coords: Coordinates;
};

const NUMBER_PERSONALITIES = 3;

export class VirtualPlayer {
	public wipController: WordImagePairController;
	public drawingInterval: NodeJS.Timeout;
	public currentPathIndex: number;
	public currentDrawingSegmentIndex: number;
	public maxTimeToDraw: number;
	public currentDrawing: Drawing;
	public personality: VirtualPlayerPersonality;

	constructor(
		public difficulty: Difficulty,
		personality?: VirtualPlayerPersonality
	) {
		personality === undefined
			? (this.personality = this.getRandomPersonality())
			: (this.personality = personality);

		this.maxTimeToDraw = (difficulty.getTime() - 3) * 1000;
		this.currentPathIndex = 0;
		this.currentDrawingSegmentIndex = 0;
		this.currentDrawing = {} as Drawing;

		this.wipController = WordImagePairController.getInstance();
	}

	public getRandomPersonality(): VirtualPlayerPersonality {
		const personality =
			Math.floor(Math.random() * NUMBER_PERSONALITIES);
		switch (personality) {
			case 0:
				return new VirtualTrump();
			case 1:
				return new VirtualKaren();
			case 2:
				return new VirtualTA();
			default:
				throw new Error();
		}
	}

	public async comment(user: string): Promise<string> {
		return await this.personality.comment(user);
	}

	public async getDrawing(word: string): Promise<Drawing> {
		const drawing = await this.wipController.getDrawing(word)
		if (drawing === undefined || drawing.paths === undefined) {
			throw new Error(`No drawings associated with '${word}'`)
		}
		return drawing
	}

	public async startDrawing(ev: WordToDrawToSendEvent) {
		if (!ev) throw new Error();
		this.currentDrawing = await this.getDrawing(ev.word);

		this.currentDrawingSegmentIndex = 0;
		this.currentPathIndex = 0;
		let totalSegments = 0;
		// eslint-disable-next-line require-await
		await this.currentDrawing.paths.foreach(async (path) => {
			totalSegments += path.coords.length;
		});
		const timeBetweenUpdates = this.maxTimeToDraw / totalSegments;
		this.drawingInterval = Sleeper.setInterval(
			() => this.drawNextSegment(),
			timeBetweenUpdates
		);
	}

	// eslint-disable-next-line max-lines-per-function
	public async drawNextSegment() {
		if (
			this.currentDrawingSegmentIndex ==
			this.currentDrawing.paths.get(this.currentPathIndex).coords.length
		) {
			this.currentDrawingSegmentIndex = 0;
			this.currentPathIndex += 1;
		}

		if (this.currentPathIndex == this.currentDrawing.paths.length())
			return this.stopDrawing();

		const path = this.currentDrawing.paths.get(this.currentPathIndex);
		const coords = path.coords[this.currentDrawingSegmentIndex];

		if (this.currentDrawingSegmentIndex == 0)
			await new SetPathReceivedEvent(
				this.personality.name,
				this.currentPathIndex,
				path.color,
				path.strokeWidth,
				path.coords[0].x + " " + path.coords[0].y,
				path.canvasSize
			).emit();

		await new AppendToPathReceivedEvent(
			this.personality.name,
			coords.x,
			coords.y
		).emit();

		this.currentDrawingSegmentIndex += 1;
	}

	public stopDrawing() {
		clearInterval(this.drawingInterval);
	}
}
