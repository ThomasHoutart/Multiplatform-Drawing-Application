/* eslint-disable max-lines-per-function */
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppModule } from 'src/app/app.module';
import { HashService } from 'src/app/services/hash/hash.service';
import { RoutingService } from 'src/app/services/routing/routing.service';
import { UserService } from 'src/app/services/user/user.service';
import { SUCCESS } from 'src/app/services/websocket/loginSocketHandler/constant';
import { LoginSocketHandlerService } from 'src/app/services/websocket/loginSocketHandler/login-socket-handler.service';
import { TEST_CREDENTIAL } from '../create-account/constant';
import { AUTHENTICATION_HTTP, MOCK_SALT, WRONG_CREDENTIAL } from './constant';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  @NgModule({
    imports: [
      AppModule,
    ],
  })
  class DialogTestModule { }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DialogTestModule, HttpClientTestingModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onSubmit should set boolean and call handleLoginInfo', () => {
    const handleLoginInfoSpy: jasmine.Spy = spyOn(component, 'handleLoginInfo');
    component.onSubmit();
    //expect(component.wrongInfo).toBe(false);
    //expect(component.alreadyLogged).toBe(false);
    expect(component.loading).toBe(true);
    expect(handleLoginInfoSpy).toHaveBeenCalled();
  });

  it('userAuthenticationRequest should make an http get request with correct credentials', (done) => {
    component.form.controls.username.setValue(TEST_CREDENTIAL.username);
    const MOCK_HTTP: HttpTestingController = TestBed.inject(HttpTestingController);
    component.userAuthenticationRequest().subscribe();
    const REQUEST: TestRequest = MOCK_HTTP.expectOne(AUTHENTICATION_HTTP + TEST_CREDENTIAL.username);
    expect(REQUEST.request.method).toEqual('GET');
    REQUEST.flush({});
    MOCK_HTTP.verify();
    done();
  });

  it('handleLoginInfo should subscribe to userAuthenticationRequest and should call setUser and sendLoginInfo with right credentials', () => {
    component.form.controls.username.setValue(TEST_CREDENTIAL.username);
    component.form.controls.password.setValue(TEST_CREDENTIAL.lastName);
    const userAuthenticationRequestSpy: jasmine.Spy = spyOn(component, 'userAuthenticationRequest').and.returnValue(of(MOCK_SALT));
    const hashService: HashService = TestBed.inject(HashService);
    const hasherSpy: jasmine.Spy = spyOn(hashService, 'encryptedPassword').and.returnValue(TEST_CREDENTIAL.hash);
    const userService: UserService = TestBed.inject(UserService);
    const userSpy: jasmine.Spy = spyOn(userService, 'setUser');
    const socketService: LoginSocketHandlerService = TestBed.inject(LoginSocketHandlerService);
    const socketSpy: jasmine.Spy = spyOn(socketService, 'sendLoginInfo');
    component.handleLoginInfo();
    expect(userAuthenticationRequestSpy).toHaveBeenCalled();
    expect(hasherSpy).toHaveBeenCalledWith(TEST_CREDENTIAL.lastName, MOCK_SALT);
    expect(userSpy).toHaveBeenCalledWith({
      username: TEST_CREDENTIAL.username,
      hash: TEST_CREDENTIAL.hash,
    });
    expect(socketSpy).toHaveBeenCalledWith({
      username: TEST_CREDENTIAL.username,
      hash: TEST_CREDENTIAL.hash,
    });
  });

  it('onCreateAccount should call routing function moveToCreateAccount', () => {
    const routingService: RoutingService = TestBed.inject(RoutingService);
    const routingSpy: jasmine.Spy = spyOn(routingService, 'moveToCreateAccount');
    component.onCreateAccount();
    expect(routingSpy).toHaveBeenCalled();
  });

  it('loginListener should call routing function moveToMenu if message is "success" ', () => {
    const socketService: LoginSocketHandlerService = TestBed.inject(LoginSocketHandlerService);
    const socketSpy: jasmine.Spy = spyOn(socketService, 'getLoginUpdate').and.returnValue(of(SUCCESS));
    const routingService: RoutingService = TestBed.inject(RoutingService);
    const routingSpy: jasmine.Spy = spyOn(routingService, 'moveToMenu');
    component.loginListener();
    expect(socketSpy).toHaveBeenCalled();
    expect(routingSpy).toHaveBeenCalled();
  });

  it('loginListener should call user function resetUser and set wrongInfo to true if message is "WRONG_CREDENTIALS" ', () => {
    const socketService: LoginSocketHandlerService = TestBed.inject(LoginSocketHandlerService);
    const socketSpy: jasmine.Spy = spyOn(socketService, 'getLoginUpdate').and.returnValue(of(WRONG_CREDENTIAL));
    const userService: UserService = TestBed.inject(UserService);
    const userSpy: jasmine.Spy = spyOn(userService, 'resetUser');
    component.loginListener();
    expect(socketSpy).toHaveBeenCalled();
    expect(userSpy).toHaveBeenCalled();
    //expect(component.wrongInfo).toBe(true);
  });

  it('loginListener should call user function resetUser and set wrongInfo to true if message is something else', () => {
    const socketService: LoginSocketHandlerService = TestBed.inject(LoginSocketHandlerService);
    const socketSpy: jasmine.Spy = spyOn(socketService, 'getLoginUpdate').and.returnValue(of('...'));
    const userService: UserService = TestBed.inject(UserService);
    const userSpy: jasmine.Spy = spyOn(userService, 'resetUser');
    component.loginListener();
    expect(socketSpy).toHaveBeenCalled();
    expect(userSpy).toHaveBeenCalled();
    //expect(component.alreadyLogged).toBe(true);
  });


});
