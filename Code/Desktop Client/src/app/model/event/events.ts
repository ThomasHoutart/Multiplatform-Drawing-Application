import { ChatMessage } from 'src/app/models/interface/chat-message-desktop';
import { EventEmitterService } from 'src/app/services/event-emitter/event-emitter.service';

export class AbstractEvent {
    constructor() {
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    visit(es: EventEmitterService): void {
        return;
    }
}

export class ChatEvent extends AbstractEvent {
    constructor(public content: ChatMessage) {
        super();
    }

    visit(es: EventEmitterService): void {
        es.emitType('ChatMessageReceived', this);
    }
}

export class SystemChatEvent extends AbstractEvent {
    constructor(public content: ChatMessage) {
        super();
    }

    visit(es: EventEmitterService): void {
        es.emitType('SystemChatMessageReceived', this);
    }
}

export class ChatMessageSentEvent extends AbstractEvent {
    constructor(public content: ChatMessage) {
        super();
    }

    visit(es: EventEmitterService): void {
        es.emitType('ChatMessageSent', this);
    }
}

export class DrawEvent extends AbstractEvent {
    constructor(public content: string) {
        super();
    }

    visit(es: EventEmitterService): void {
        es.emitType('DrawEvent', this);
    }
}
