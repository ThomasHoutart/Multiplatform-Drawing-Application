import { EventEmitter } from "../EventEmitter";
import { SocketInterface } from "../services/network/Socket/SocketService";
import { LoginCredential, Trophy } from "../types/user";
import { AbstractEvent } from "./AbstractEvent";

export class UserTrophyEvent extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await UserTrophyEvent.emitter.emit(this);
    }
    public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
        this.emitter.subscribe(f);
    }

    constructor(
        public trophy: Trophy,
        public username: string,
    ) {
        super();
    }
}

export class UserCreatedEvent extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await UserCreatedEvent.emitter.emit(this);
    }
    public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
        this.emitter.subscribe(f);
    }

    constructor(
        public user: string,
    ) {
        super();
    }
}

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
        public avatar: string,
    ) {
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

export class UserCheatedEvent extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await UserCheatedEvent.emitter.emit(this);
    }
    public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
        this.emitter.subscribe(f);
    }

    constructor(
        public username: string,
    ) {
        super();
    }
}
