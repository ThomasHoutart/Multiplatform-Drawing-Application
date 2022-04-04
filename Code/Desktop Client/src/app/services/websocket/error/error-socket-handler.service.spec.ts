import { TestBed } from '@angular/core/testing';

import { ErrorSocketHandlerService } from './error-socket-handler.service';

describe('ErrorSocketHandlerService', () => {
  let service: ErrorSocketHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorSocketHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
