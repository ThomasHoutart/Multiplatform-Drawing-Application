import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';

import { LogoutSocketHandlerService } from './logout-socket-handler.service';

describe('LogoutSocketHandlerService', () => {
  let service: LogoutSocketHandlerService;

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
    service = TestBed.inject(LogoutSocketHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
