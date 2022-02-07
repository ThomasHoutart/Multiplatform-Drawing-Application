import { AbstractEvent } from "./AbstractEvent";
import { EventEmitter } from "../EventEmitter";
import { LoginCredential } from "../types/user";
import { SocketInterface } from "../services/network/Socket/SocketService";

export class LoginEvent<Socket extends SocketInterface> extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await LoginEvent.emitter.emit(this);
    }
    public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
        this.emitter.subscribe(f);
    }

    constructor(
        public socket: Socket,
        public username: string,
        public email: string,
        public firstName: string,
        public lastName: string,
        public hashSocketId: string,
        public avatar: number,
        public firstTime: boolean,
    ) {
        super();
    }
}

export class LogoutEvent extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await LogoutEvent.emitter.emit(this);
    }
    public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
        this.emitter.subscribe(f);
    }

    constructor(public user: string) {
        super();
    }
}

export class AuthenticationEvent<Socket extends SocketInterface> extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await AuthenticationEvent.emitter.emit(this);
    }
    public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
        this.emitter.subscribe(f);
    }

    constructor(
        public socket: Socket,
        public credentials: LoginCredential,
    ) {
        super();
    }
}
