import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndRoundDialogComponent } from './end-round-dialog.component';

describe('EndRoundDialogComponent', () => {
  let component: EndRoundDialogComponent;
  let fixture: ComponentFixture<EndRoundDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EndRoundDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndRoundDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
