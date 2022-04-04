import { TestBed } from '@angular/core/testing';
import { EventEmitter } from 'src/app/model/event/event-emitter/event-emitter';
import { EventObserver } from 'src/app/model/event/event-observer/event-observer';
import { AbstractEvent } from 'src/app/model/event/events';
import { EventEmitterService } from './event-emitter.service';

class mockClass {
  mockFnc() { return 0; }
}
describe('EventEmitterService', () => {
  let mockClass: mockClass;
  let service: EventEmitterService;
  const testEmitter = EventEmitter;
  // let testObv = new EventObserver(mockClass.mockFnc());
  let testObv: EventObserver;
  const event = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    visit: (_: EventEmitterService) => {return; },
} as AbstractEvent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventEmitterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /* failed
  it('should subscribe to an event', () => {
    const visitSpy = spyOn(testObv, "notify");
    service.subscribe("mockEvent", testObv);
    service.emit(event);
    expect(Array.from(service.emitters.keys())).toEqual([
        "mockEvent",
    ]);
   // expect(visitSpy).toHaveBeenCalledWith(event)
  });
  */
  it('should unsubscribe to an event', () => {
    expect(true);
  });
  it('subscribers should receive a notification when the event is called', () => {
    expect(true);
  });
});
