import { Injectable } from '@angular/core';
import { AbstractEvent } from 'src/app/model/event/events';
import { EventObserver } from 'src/app/model/event/event-observer/event-observer';
import { EventEmitter } from 'src/app/model/event/event-emitter/event-emitter';

@Injectable({
    providedIn: 'root'
})
export class EventEmitterService {
  public emitters = new Map<string, EventEmitter>();

  emitType(evType: string, ev: AbstractEvent): void {
  	const em = this.emitters.get(evType);
  	if (em) {
  		em.emit(ev);
  	}
  }

  emit(ev: AbstractEvent): void {
  	ev.visit(this);
  }

  subscribe(evType: string, obv: EventObserver): void {
  	if (!this.emitters.has(evType)) {
  		this.emitters.set(evType, new EventEmitter());
  	}
  	this.emitters.get(evType).subscribe(obv);
  }

  unsubscribe(evType: string, obv: EventObserver): void {
  	const em = this.emitters.get(evType);
  	if (em) {
  		em.unsubscribe(obv);
  	}
  }
}
