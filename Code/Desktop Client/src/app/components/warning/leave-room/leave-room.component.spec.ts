import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveRoomComponent } from './leave-room.component';

describe('LeaveRoomComponent', () => {
  let component: LeaveRoomComponent;
  let fixture: ComponentFixture<LeaveRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveRoomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
