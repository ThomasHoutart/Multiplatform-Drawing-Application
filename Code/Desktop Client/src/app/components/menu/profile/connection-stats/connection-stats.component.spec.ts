import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionStatsComponent } from './connection-stats.component';

describe('ConnectionStatsComponent', () => {
  let component: ConnectionStatsComponent;
  let fixture: ComponentFixture<ConnectionStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectionStatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
