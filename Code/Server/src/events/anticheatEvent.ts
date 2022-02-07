import { EventEmitter } from "../EventEmitter";
import { AbstractEvent } from "./AbstractEvent";

export class KickGameChatMessageReceivedEvent extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await KickGameChatMessageReceivedEvent.emitter.emit(this);
    }
    public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
        this.emitter.subscribe(f);
    }

    constructor(
        public author: string,
        public roomName: string,
        public target: string
    ) {
        super();
    }
}

export class VoteGameChatMessageReceivedEvent extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await VoteGameChatMessageReceivedEvent.emitter.emit(this);
    }
    public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
        this.emitter.subscribe(f);
    }

    constructor(
        public author: string,
        public roomName: string,
        public isKick: boolean
    ) {
        super();
    }
}