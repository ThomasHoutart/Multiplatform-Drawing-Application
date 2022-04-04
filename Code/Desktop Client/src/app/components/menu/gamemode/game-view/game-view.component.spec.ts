/* eslint-disable max-lines-per-function */
import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';

import { GameViewComponent } from './game-view.component';

describe('GameViewComponent', () => {
    let component: GameViewComponent;
    let fixture: ComponentFixture<GameViewComponent>;

  @NgModule({
      imports: [
          AppModule,
      ],
  })
    class DialogTestModule { }

  beforeEach(async () => {
      await TestBed.configureTestingModule({
          imports: [ DialogTestModule ],
          declarations: [ GameViewComponent ]
      })
          .compileComponents();
  });

  beforeEach(() => {
      fixture = TestBed.createComponent(GameViewComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
  });

  it('should create', () => {
      expect(component).toBeTruthy();
  });
});
