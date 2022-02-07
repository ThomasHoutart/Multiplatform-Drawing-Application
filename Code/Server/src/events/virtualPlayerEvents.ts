import { EventEmitter } from "../EventEmitter";
import { AbstractEvent } from "./AbstractEvent";

export class HintGameChatMessageReceivedEvent extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await HintGameChatMessageReceivedEvent.emitter.emit(this);
    }
    public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
        this.emitter.subscribe(f);
    }

    constructor(
        public author: string,
        public roomName: string,
    ) {
        super();
    }
}

export class AddBotReceivedEvent extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await AddBotReceivedEvent.emitter.emit(this);
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
