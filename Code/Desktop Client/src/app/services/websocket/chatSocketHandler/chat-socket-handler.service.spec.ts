import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';

import { ChatSocketHandlerService } from './chat-socket-handler.service';

describe('ChatSocketHandlerService', () => {
  let service: ChatSocketHandlerService;

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
    service = TestBed.inject(ChatSocketHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
