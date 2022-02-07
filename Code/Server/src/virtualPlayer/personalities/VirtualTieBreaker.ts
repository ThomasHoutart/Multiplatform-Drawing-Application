import { UserController } from "../../database/user/UserController";
import { VirtualPlayerPersonality } from "../VirtualPlayerPersonnality";

export class VirtualTieBreaker extends VirtualPlayerPersonality {
	constructor() {
		super();
	}

	setName() {
		const name = 'TieBreaker'
		const randomSuffix = this.randomNumber(1000);
		return `bot_${name}${randomSuffix}`;
	}

	async comment(username: string) {
		await UserController.getInstance().get(username)
		return '';
	}
}
