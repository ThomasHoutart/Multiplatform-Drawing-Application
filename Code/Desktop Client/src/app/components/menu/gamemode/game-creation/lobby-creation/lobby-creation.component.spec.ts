import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LobbyCreationComponent } from './lobby-creation.component';

describe('LobbyCreationComponent', () => {
  let component: LobbyCreationComponent;
  let fixture: ComponentFixture<LobbyCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LobbyCreationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LobbyCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
