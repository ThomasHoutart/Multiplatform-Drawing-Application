import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';

import { GameSocketHandlerService } from './game-socket-handler.service';

describe('GameSocketHandlerService', () => {
  let service: GameSocketHandlerService;

  @NgModule({
    imports: [
      AppModule,
    ],
  })
  class DialogTestModule { }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DialogTestModule ],

    });
    service = TestBed.inject(GameSocketHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
