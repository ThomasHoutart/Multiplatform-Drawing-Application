import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveLobbyComponent } from './leave-lobby.component';

describe('LeaveLobbyComponent', () => {
  let component: LeaveLobbyComponent;
  let fixture: ComponentFixture<LeaveLobbyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveLobbyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveLobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
