import express from "express";
import { UserController } from "../../../database/user/UserController";

export class HttpProfileService {
	constructor(
        private app: express.Express,
        private userController: UserController,
	) {}

	public init(): void {
		this.requestProfile();
	}

	private requestProfile() {
		this.app.get("/profile/", async (request, response) => {
			await this.doRequestProfile(request, response);
		});
	}

	private doRequestProfile = async (request: any, response: any) => {
		try {
            const profileInfo = await this.userController.getUserProfile(request.query.username);
            response.status(200).json(profileInfo);
		} catch (e) {
			(console).log(e)
			response.sendStatus(500);
		}
    };
    
    // TODO: catch errors
}
