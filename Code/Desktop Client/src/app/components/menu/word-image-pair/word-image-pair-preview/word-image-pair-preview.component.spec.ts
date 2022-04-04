/* eslint-disable max-lines-per-function */
import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';

import { WordImagePairPreviewComponent } from './word-image-pair-preview.component';

describe('WordImagePairPreviewComponent', () => {
    let component: WordImagePairPreviewComponent;
    let fixture: ComponentFixture<WordImagePairPreviewComponent>;

  @NgModule({
      imports: [
          AppModule,
      ],
  })
    class DialogTestModule { }

  beforeEach(async () => {
      await TestBed.configureTestingModule({
          imports: [ DialogTestModule ],
          declarations: [ WordImagePairPreviewComponent ]
      })
          .compileComponents();
  });

  beforeEach(() => {
      fixture = TestBed.createComponent(WordImagePairPreviewComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
  });

  it('should create', () => {
      expect(component).toBeTruthy();
  });
});
