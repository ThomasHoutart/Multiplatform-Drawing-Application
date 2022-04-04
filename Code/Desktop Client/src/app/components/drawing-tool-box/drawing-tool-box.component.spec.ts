import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';

import { DrawingToolBoxComponent } from './drawing-tool-box.component';

describe('DrawingToolBoxComponent', () => {
  let component: DrawingToolBoxComponent;
  let fixture: ComponentFixture<DrawingToolBoxComponent>;
  
  @NgModule({
    imports: [
      AppModule,
    ],
  })
  class DialogTestModule { }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogTestModule],
      declarations: [ DrawingToolBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawingToolBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
