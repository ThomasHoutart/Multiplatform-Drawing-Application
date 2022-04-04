import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginTutoComponent } from './login-tuto.component';

describe('LoginTutoComponent', () => {
  let component: LoginTutoComponent;
  let fixture: ComponentFixture<LoginTutoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginTutoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginTutoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
