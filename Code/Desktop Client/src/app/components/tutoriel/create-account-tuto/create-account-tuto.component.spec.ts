import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAccountTutoComponent } from './create-account-tuto.component';

describe('CreateAccountTutoComponent', () => {
  let component: CreateAccountTutoComponent;
  let fixture: ComponentFixture<CreateAccountTutoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateAccountTutoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAccountTutoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
