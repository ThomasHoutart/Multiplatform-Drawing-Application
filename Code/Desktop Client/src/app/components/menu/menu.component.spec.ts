import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';
import { RoomService } from 'src/app/services/room/room.service';
import { RoutingService } from 'src/app/services/routing/routing.service';
import { LogoutSocketHandlerService } from 'src/app/services/websocket/logoutSocketHandler/logout-socket-handler.service';

import { MenuComponent } from './menu.component';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  @NgModule({
    imports: [
      AppModule,
    ],
  })
  class DialogTestModule { }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DialogTestModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('logout should call socket function logout, routing function moveToLogin and room function resetRoom', () => {
    const socketService: LogoutSocketHandlerService = TestBed.inject(LogoutSocketHandlerService);
    const socketSpy: jasmine.Spy = spyOn(socketService, 'logout');
    const routingService: RoutingService = TestBed.inject(RoutingService);
    const routingSpy: jasmine.Spy = spyOn(routingService, 'moveToLogin');
    const roomService: RoomService = TestBed.inject(RoomService);
    const roomSpy: jasmine.Spy = spyOn(roomService, 'resetRoom');
    component.logout();
    expect(socketSpy).toHaveBeenCalled();
    expect(routingSpy).toHaveBeenCalled();
    expect(roomSpy).toHaveBeenCalled();
  });

});
