import { PermissionError } from "../errors/generic";
import { UserDoesNotExistError } from "../errors/user";
import { Sleeper } from "./Sleeper";

export interface HashTimeoutPair {
    salt: Uint8Array,
    timeout: NodeJS.Timeout,
}

export class SaltService {
    private tempSaltsByUser: Map<string, HashTimeoutPair>;

    constructor(
    ) {
        this.tempSaltsByUser = new Map();
    }

    public init(): void {
        return;
    }

    public requestNewSalt(): Uint8Array {
        const arr: number[] = [];
        for (let i = 0; i < 16; ++i)
            arr.push(Math.floor(Math.random() * 256));
        return Uint8Array.from(arr)
    }

    public requestNewSaltForUserLogin(user: string): Uint8Array {
        this.tempSaltsByUser.delete(user);
        const salt = this.requestNewSalt();
        this.tempSaltsByUser.set(user, {salt, timeout: this.deleteIn10Seconds(user)});
        return salt;
    }

    public deleteIn10Seconds(user: string): NodeJS.Timeout {
        return Sleeper.setTimeout(() => {
            this.tempSaltsByUser.delete(user);
        }, 10000);
    }

    public getSaltToValidateLogin(user: string): Uint8Array {
        const pair = this.tempSaltsByUser.get(user);
        if (pair)
            return pair.salt;
        throw new UserDoesNotExistError();
    }

    public validateUserLogin(user: string): void {
        const pair = this.tempSaltsByUser.get(user);
        if (!pair)
            throw new PermissionError();
        clearTimeout(pair.timeout);
        this.tempSaltsByUser.delete(user);
    }
}
