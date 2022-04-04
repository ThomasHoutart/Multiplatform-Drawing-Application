import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveGameComponent } from './leave-game.component';

describe('LeaveGameComponent', () => {
  let component: LeaveGameComponent;
  let fixture: ComponentFixture<LeaveGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveGameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
