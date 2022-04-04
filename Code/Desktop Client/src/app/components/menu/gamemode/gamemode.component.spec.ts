/* eslint-disable max-lines-per-function */
import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';

import { GamemodeComponent } from './gamemode.component';

describe('GamemodeComponent', () => {
    let component: GamemodeComponent;
    let fixture: ComponentFixture<GamemodeComponent>;

  @NgModule({
      imports: [
          AppModule,
      ],
  })
    class DialogTestModule { }

  beforeEach(async () => {
      await TestBed.configureTestingModule({
          imports: [ DialogTestModule ],
          declarations: [ GamemodeComponent ]
      })
          .compileComponents();
  });

  beforeEach(() => {
      fixture = TestBed.createComponent(GamemodeComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
  });

  it('should create', () => {
      expect(component).toBeTruthy();
  });
});
