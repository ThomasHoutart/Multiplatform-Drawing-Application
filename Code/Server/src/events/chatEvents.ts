import { AbstractEvent } from "./AbstractEvent";
import { EventEmitter } from "../EventEmitter";
import { List } from "../List";
import { ChatMessageToSend } from "../types/message";

export class ChatMessageReceivedEvent extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await ChatMessageReceivedEvent.emitter.emit(this);
    }
    public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
        this.emitter.subscribe(f);
    }

    constructor(
        public author: string, 
        public roomName: string, 
        public message: string,
        public timestamp: Date,
        public avatar: number,
    ) {
        super();
    }
}

export class GameChatMessageReceivedEvent extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await GameChatMessageReceivedEvent.emitter.emit(this);
    }
    public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
        this.emitter.subscribe(f);
    }

    constructor(
        public author: string, 
        public roomName: string, 
        public message: string,
        public timestamp: Date,
        public avatar: number,
    ) {
        super();
    }
}

export class ChatMessageToSendEvent extends AbstractEvent {
    public static emitter: EventEmitter = new EventEmitter();
    public async emit(): Promise<void> {
        await ChatMessageToSendEvent.emitter.emit(this);
    }
    public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
        this.emitter.subscribe(f);
    }

    constructor(
        public receivers: List<string>,
        public message: ChatMessageToSend,
    ) {
        super();
    }
}
