import { AbstractEvent } from 'src/app/model/event/events';

export class EventObserver {
    constructor(private lambda: CallableFunction) {}

    notify(ev: AbstractEvent): void {
        this.lambda(ev);
    }
}
