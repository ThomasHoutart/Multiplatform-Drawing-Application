import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { ChildWindowHandlerService } from './child-window-handler.service';

const childWindowHandlerServiceStub = {
  // tslint:disable-next-line:typedef
  get() {
    return of( [{id: 1}] );
  }
};

describe('ChildWindowHandlerService', () => {
  let service: ChildWindowHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    });
    service = TestBed.inject(ChildWindowHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Should send an event to open a new window', () => {
    let test = false;
    const mockMessageSource = new BehaviorSubject('INTEGRATED');
    const mockCurrentChatState = mockMessageSource.asObservable();
    mockCurrentChatState.subscribe(chatState => {
      test = true;
    });
    service.openChatWindow();
    expect(test).toBe(true);
  });
});
