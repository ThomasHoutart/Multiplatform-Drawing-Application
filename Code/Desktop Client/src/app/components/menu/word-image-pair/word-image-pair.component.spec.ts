import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';

import { WordImagePairComponent } from './word-image-pair.component';

describe('WordImagePairComponent', () => {
  let component: WordImagePairComponent;
  let fixture: ComponentFixture<WordImagePairComponent>;

  @NgModule({
    imports: [
      AppModule,
    ],
  })
  class DialogTestModule { }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DialogTestModule ],
      declarations: [ WordImagePairComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WordImagePairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
