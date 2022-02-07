import { AbstractEvent } from "./events/AbstractEvent";
import { List } from "./List";

export class EventEmitter {
    public subscribers: List<(ev: AbstractEvent) => Promise<void>>;

    constructor() {
        this.subscribers = new List<(ev: AbstractEvent) => Promise<void>>();
    }

    public emit(ev: AbstractEvent): Promise<void> {
        return this.subscribers.foreach(async (f: (ev: AbstractEvent) => Promise<void>) => {
            await f(ev);
        });
    }

    public subscribe(f: (ev: AbstractEvent) => Promise<void>): void {
        this.subscribers.push(f);
    }

    public unsubscribe(f: (ev: AbstractEvent) => Promise<void>): void {
        this.subscribers.remove(f);
    }
}
