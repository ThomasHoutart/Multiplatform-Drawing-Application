import { AbstractEvent } from 'src/app/model/event/events';
import { EventObserver } from 'src/app/model/event/event-observer/event-observer';

export class EventEmitter {
    subscribers: EventObserver[] = [];

    emit(ev: AbstractEvent): void {
    	for (let i = 0; i < this.subscribers.length; ++i) {
    		this.subscribers[i].notify(ev);
    	}
    }

    subscribe(obv: EventObserver): void {
    	this.subscribers.push(obv);
    }

    unsubscribe(obv: EventObserver): void {
    	const i = this.subscribers.indexOf(obv);
    	if (i >= 0) {
    		this.subscribers.splice(i, 1);
    	}
    }
}
