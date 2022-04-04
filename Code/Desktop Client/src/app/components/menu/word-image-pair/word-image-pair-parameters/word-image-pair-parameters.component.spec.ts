import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';

import { WordImagePairParametersComponent } from './word-image-pair-parameters.component';

describe('WordImagePairParametersComponent', () => {
  let component: WordImagePairParametersComponent;
  let fixture: ComponentFixture<WordImagePairParametersComponent>;

  @NgModule({
    imports: [
      AppModule,
    ],
  })
  class DialogTestModule { }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DialogTestModule ],
      declarations: [ WordImagePairParametersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WordImagePairParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
