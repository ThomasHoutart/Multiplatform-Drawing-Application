import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveNewPasswordComponent } from './leave-new-password.component';

describe('LeaveNewPasswordComponent', () => {
  let component: LeaveNewPasswordComponent;
  let fixture: ComponentFixture<LeaveNewPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveNewPasswordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveNewPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
