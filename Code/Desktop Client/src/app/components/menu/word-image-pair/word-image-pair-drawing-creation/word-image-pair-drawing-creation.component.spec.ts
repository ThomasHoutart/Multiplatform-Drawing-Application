import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';

import { WordImagePairDrawingCreationComponent } from './word-image-pair-drawing-creation.component';

describe('WordImagePairDrawingCreationComponent', () => {
  let component: WordImagePairDrawingCreationComponent;
  let fixture: ComponentFixture<WordImagePairDrawingCreationComponent>;

  @NgModule({
    imports: [
      AppModule,
    ],
  })
  class DialogTestModule { }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DialogTestModule ],
      declarations: [ WordImagePairDrawingCreationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WordImagePairDrawingCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
