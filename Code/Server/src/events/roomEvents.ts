import { List } from "../List";
import { EventEmitter } from "../EventEmitter";
import { AbstractEvent } from "./AbstractEvent";

export class JoinRoomReceivedEvent extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await JoinRoomReceivedEvent.emitter.emit(this);
    }
    public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
        this.emitter.subscribe(f);
    }

    constructor(
        public username: string, 
        public roomName: string, 
    ) {
        super();
    }
}

export class JoinRoomToSendEvent extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await JoinRoomToSendEvent.emitter.emit(this);
    }
    public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
        this.emitter.subscribe(f);
    }

    constructor(
        public username: string,
        public roomName: string,
        public creator: string,
        public receivers: List<string>,
    ) {
        super();
    }
}

export class LeaveRoomReceivedEvent extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await LeaveRoomReceivedEvent.emitter.emit(this);
    }
    public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
        this.emitter.subscribe(f);
    }

    constructor(
        public username: string, 
        public roomName: string, 
    ) {
        super();
    }
}

export class LeaveRoomToSendEvent extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await LeaveRoomToSendEvent.emitter.emit(this);
    }
    public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
        this.emitter.subscribe(f);
    }

    constructor(
        public username: string,
        public roomName: string,
        public creator: string,
        public receivers: List<string>,
    ) {
        super();
    }
}

export class CreateRoomReceivedEvent extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await CreateRoomReceivedEvent.emitter.emit(this);
    }
    public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
        this.emitter.subscribe(f);
    }

    constructor(
        public username: string, 
        public roomName: string, 
    ) {
        super();
    }
}

export class CreateRoomToSendEvent extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await CreateRoomToSendEvent.emitter.emit(this);
    }
    public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
        this.emitter.subscribe(f);
    }

    constructor(
        public username: string,
        public roomName: string,
    ) {
        super();
    }
}

export class DeleteRoomReceivedEvent extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await DeleteRoomReceivedEvent.emitter.emit(this);
    }
    public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
        this.emitter.subscribe(f);
    }

    constructor(
        public username: string, 
        public roomName: string, 
    ) {
        super();
    }
}

export class DeleteRoomToSendEvent extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await DeleteRoomToSendEvent.emitter.emit(this);
    }
    public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
        this.emitter.subscribe(f);
    }

    constructor(
        public username: string,
        public roomName: string,
    ) {
        super();
    }
}
