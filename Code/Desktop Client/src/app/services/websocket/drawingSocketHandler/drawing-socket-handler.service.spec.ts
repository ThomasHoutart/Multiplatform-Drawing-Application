import { TestBed } from '@angular/core/testing';

import { DrawingSocketHandlerService } from './drawing-socket-handler.service';

describe('DrawingSocketHandlerService', () => {
  let service: DrawingSocketHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrawingSocketHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
