import { UserController } from "../../../database/user/UserController";
import { AuthenticationEvent, LoginEvent } from "../../../events/connectionEvents";
import { HashService } from "../../HashService";
import { UserService } from "../../Core/UserService";
import { SaltService } from "../../SaltService";
import { SocketInterface } from "./SocketService";
import { BadPasswordError, UserAlreadyLoggedInError, UserCheatedError } from "../../../errors/user";
import { Sleeper } from "../../Sleeper";

export class SocketAuthenticatorService<Socket extends SocketInterface> {
    public userCheated: Set<string>;

    constructor(
        private hashService: HashService,
        private userController: UserController,
        private saltService: SaltService,
        private userService: UserService<Socket>,
    ) {
        this.userCheated = new Set();
    }

    public init(): void { return }

    async authenticate(ev: AuthenticationEvent<Socket>): Promise<void> {
        const loginSalt = this.saltService.getSaltToValidateLogin(ev.credentials.username).toString();
        const dbHashStr = await this.userController.getHashForExistingUser(ev.credentials.username);
        const expectedHash = this.hashService.hashString(loginSalt + dbHashStr).toString();
        const valid = expectedHash == ev.credentials.hash;
        if (!valid)
            throw new BadPasswordError();
        const userLoggedIn = this.userService.userIsLoggedIn(ev.credentials.username);
        if (userLoggedIn)
            throw new UserAlreadyLoggedInError();
        if (this.userCheated.has(ev.credentials.username))
            throw new UserCheatedError();
        this.saltService.validateUserLogin(ev.credentials.username);
        const user = await this.userController.get(ev.credentials.username)
        await new LoginEvent(
            ev.socket,
            ev.credentials.username,
            user.email,
            user.firstName,
            user.lastName,
            this.hashService.hashString(ev.credentials.hash + ev.socket.id).toString(),
            user.avatar,
            user.connections.length() == 0 ? true : false
        ).emit();
    }

    public cheated(username: string) {
        this.userCheated.add(username);
        Sleeper.setTimeout(() => {
            this.userCheated.delete(username);
        }, 60000);
    }
}
