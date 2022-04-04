import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketIoModule } from 'ngx-socket-io';
import { AppModule } from 'src/app/app.module';
import { RoutingService } from 'src/app/services/routing/routing.service';

import { LogoutSocketHandlerService } from 'src/app/services/websocket/logoutSocketHandler/logout-socket-handler.service';
import { AppComponent } from './app.component';

describe('AppComponent', () => {

  let routingService: RoutingService;
  let logoutSocketHandlerService: LogoutSocketHandlerService;
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let routingSpy;
  let logoutSpy;

  @NgModule({
    imports: [
      AppModule,
    ],
  })
  class DialogTestModule { }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule, DialogTestModule
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        LogoutSocketHandlerService, SocketIoModule
      ]
    }).compileComponents();

    routingService = TestBed.inject(RoutingService);
    logoutSocketHandlerService = TestBed.inject(LogoutSocketHandlerService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
/*
  it('should nav to login ngOnInit"', async () => {
    routingSpy = spyOn(routingService, 'moveToLogin');
    component.ngOnInit();
    await fixture.whenStable();
    expect(routingSpy).toHaveBeenCalled();
  });
*/
  it('should nav to login ngOnDestroy"', async () => {
    logoutSpy = spyOn(logoutSocketHandlerService, 'logout');
    component.ngOnDestroy();
    await fixture.whenStable();
    expect(logoutSpy).toHaveBeenCalled();
  });

  it(`should have as title 'drawhub'`, () => {
    const app = fixture.componentInstance;
    expect(app.title).toEqual('drawhub');
  });
});
