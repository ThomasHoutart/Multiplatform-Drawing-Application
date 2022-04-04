
import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';
import { PencilToolHandlerService } from './pencil-tool-handler.service';

describe('PencilToolHandlerService', () => {

  let service: PencilToolHandlerService;

  @NgModule({
    imports: [
      AppModule,
    ],
  })
  class DialogTestModule { }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DialogTestModule],
    });

    service = TestBed.inject(PencilToolHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  
});
