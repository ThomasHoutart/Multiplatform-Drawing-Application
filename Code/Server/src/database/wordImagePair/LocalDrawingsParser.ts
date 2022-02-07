import { readFileSync } from "fs";
import { readdirSync } from "fs";
import { List } from "../../List";
import { Coordinates, Drawing, Path } from "../../virtualPlayer/virtualPlayer";

export class LocalDrawingPaser {
	fetchLocalDrawings() {
		const drawings = new List<Drawing>();
		readdirSync("./drawings").forEach((file) => {
			const drawing = JSON.parse(
				readFileSync(`./drawings/${file}`, "utf-8")
			);
			const parsedPaths = new List<Path>();
			drawing.paths.forEach((element: any) =>
				parsedPaths.push(this.formatPath(element))
			);
			drawings.push({
				artist: drawing.artist,
				word: drawing.word,
				canvasSize: drawing.canvasSize,
				difficulty: drawing.difficulty,
				paths: new List(parsedPaths),
				hints: new List(drawing.hints),
			});
		});
		return drawings;
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
