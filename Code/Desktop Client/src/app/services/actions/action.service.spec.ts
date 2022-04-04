import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';
import { ActionService } from './action.service';

describe('ActionService', () => {

  let service: ActionService;

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
    service = TestBed.inject(ActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  
});
