import { TestBed } from '@angular/core/testing';

import { LobbySocketHandlerService } from './lobby-socket-handler.service';

describe('LobbySocketHandlerService', () => {
  let service: LobbySocketHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LobbySocketHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
