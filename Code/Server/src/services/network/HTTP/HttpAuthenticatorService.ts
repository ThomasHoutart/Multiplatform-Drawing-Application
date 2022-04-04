import express from "express";
import { UserController } from "../../../database/user/UserController";
import { ClientUser } from "../../../types/user";
import { HashService } from "../../HashService";
import { SaltService } from "../../SaltService";
import { RoomController } from "../../../database/room/RoomController";
import { KnownError, PermissionError } from "../../../errors/generic";
import { UsernameExistsError, EmailExistsError } from "../../../errors/user";

export interface Salts {
    tempSalt: string;
    permSalt: string;
}

export class HttpAuthenticatorService {
    constructor(
        public app: express.Express,
        public hashService: HashService,
        public userController: UserController,
        public roomController: RoomController,
        public saltService: SaltService
    ) {}

    public init(): void {
        this.requestRegister();
        this.requestSalts();
    }

    public requestRegister(): void {
        this.app.post("/auth/register/", async (request, response) => {
            await this.doAuthRegister(request, response);
        });
    }

    public doAuthRegister = async (request: any, response: any) => {
        try {
            const credentials = this.createCredentialsFromRequest(request);
            const lower = credentials.username.toLowerCase();
            if (lower.startsWith('bot_') || lower.startsWith('sys') || lower == 'undefined' || lower == 'null')
                throw new PermissionError();
            await this.register(credentials);
            await response.sendStatus(200);
        } catch (e) {
            await response.sendStatus(this.getErrorCode(e));
        }
    }

    public getErrorCode(e: Error): number {
        if (e instanceof KnownError) {
            if (e instanceof UsernameExistsError)
                return 409;
            else if (e instanceof EmailExistsError)
                return 410
            else if (e instanceof PermissionError)
                return 414;
        }
        return 500;
    }

    public createCredentialsFromRequest(request: any): ClientUser {
        return {
            firstName: request.body.firstName as string,
            lastName: request.body.lastName as string,
            username: request.body.username as string,
            email: request.body.email as string,
            hash: request.body.hash as string,
            salt: '',
            avatar: request.body.avatar as number,
        };
    }

    public async register(credentials: ClientUser): Promise<void> {
        const salt = this.saltService.requestNewSalt();
        const hashToStore = this.hashService.hashString(salt.toString() + credentials.hash);
        credentials.hash = hashToStore.toString();
        credentials.salt = salt.toString();
        await this.userController.assertNotUsedCredentials(
            credentials.username,
            credentials.email
        );
        await this.userController.add(credentials);
        await this.roomController.addUser("General", credentials.username);
    }

    public requestSalts() {
        this.app.get("/auth/salt/", async (request, response) => {
            await this.doRequestSalt(request, response);
        });
    }

    public doRequestSalt = async (request: any, response: any) => {
        try {
            const username = request.query.user as string;
            const salts = await this.getSalts(username);
            await response.status(200).json(salts);
        } catch (e) {
            const CodeAndError = {
                code: 400,
                Error: e.name,
            };
            await response.status(CodeAndError.code).json(CodeAndError.Error);
        }
    }
    public async getSalts(username: string): Promise<Salts> {
        const user = await this.userController.get(username);
        const permSalt = user.salt;
        const tempSalt = this.saltService.requestNewSaltForUserLogin(username).toString();
        return {
            tempSalt: tempSalt,
            permSalt: permSalt,
        };
    }
}
