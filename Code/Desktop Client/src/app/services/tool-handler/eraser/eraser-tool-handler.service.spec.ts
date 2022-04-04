/* eslint-disable max-lines-per-function */
import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';
import { EraserToolHandlerService } from './eraser-tool-handler.service';

describe('EraserToolHandlerService', () => {
    let service: EraserToolHandlerService;
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

      service = TestBed.inject(EraserToolHandlerService);
  });
  it('should be created', () => {
      expect(service).toBeTruthy();
  });
});
