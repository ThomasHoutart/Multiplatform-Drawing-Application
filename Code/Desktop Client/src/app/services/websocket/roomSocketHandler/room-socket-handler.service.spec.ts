import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';

import { RoomSocketHandlerService } from './room-socket-handler.service';

describe('RoomSocketHandlerService', () => {
  let service: RoomSocketHandlerService;

  @NgModule({
    imports: [
      AppModule,
    ],
  })
  class DialogTestModule { }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DialogTestModule]
    });
    service = TestBed.inject(RoomSocketHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
