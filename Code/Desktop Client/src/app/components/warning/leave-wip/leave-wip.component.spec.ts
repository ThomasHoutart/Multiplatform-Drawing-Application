import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveWIPComponent } from './leave-wip.component';

describe('LeaveWIPComponent', () => {
  let component: LeaveWIPComponent;
  let fixture: ComponentFixture<LeaveWIPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveWIPComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveWIPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
