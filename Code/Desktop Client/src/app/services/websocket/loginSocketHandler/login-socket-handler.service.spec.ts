import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';

import { LoginSocketHandlerService } from './login-socket-handler.service';

describe('LoginSocketHandlerService', () => {
  let service: LoginSocketHandlerService;

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
    service = TestBed.inject(LoginSocketHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
