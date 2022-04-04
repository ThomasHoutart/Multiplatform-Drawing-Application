/* eslint-disable max-lines-per-function */
import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AppModule } from 'src/app/app.module';
import { DIALOG_MOCK } from 'src/app/models/mock/dialog';
import { RoomService } from 'src/app/services/room/room.service';
import { MOCK_ROOM, MOCK_ROOM_INFO } from '../chat-joined-room/constant';
import { ChatRoomComponent } from './chat-room.component';

describe('ChatRoomComponent', () => {
    let component: ChatRoomComponent;
    let fixture: ComponentFixture<ChatRoomComponent>;

  @NgModule({
      imports: [
          AppModule,
      ],
      providers: [
          {provide: MatDialogRef, useValue: DIALOG_MOCK},
      ]
  })
    class DialogTestModule { }

  beforeEach(async () => {
      await TestBed.configureTestingModule({
          imports: [ DialogTestModule ],
      })
          .compileComponents();
  });

  beforeEach(() => {
      fixture = TestBed.createComponent(ChatRoomComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
  });

  it('should create', () => {
      expect(component).toBeTruthy();
  });

  it('onChange should update filteredRoomList by affecting return value from room function updateRoomSearchList', () => {
      const roomService: RoomService = TestBed.inject(RoomService);
      const updateRoomSpy: jasmine.Spy = spyOn(roomService, 'updateRoomSearchList').and.returnValue([MOCK_ROOM_INFO]);
      component.onChange();
      expect(updateRoomSpy).toHaveBeenCalled();
      expect(component.filteredRoomList).toEqual([MOCK_ROOM_INFO]);
  });

  it('onJoin should call room function clearCounter, joinRoom and dialogRef function close', () => {
      const roomService: RoomService = TestBed.inject(RoomService);
      const counterSpy: jasmine.Spy = spyOn(roomService, 'clearCounter');
      const joinRoomSpy: jasmine.Spy = spyOn(roomService, 'joinRoom');
      const dialogRefSpy: jasmine.Spy = spyOn(component.dialogRef, 'close').and.callThrough();
      component.onJoin(MOCK_ROOM_INFO);
      expect(counterSpy).toHaveBeenCalledWith(MOCK_ROOM_INFO.roomName);
      expect(joinRoomSpy).toHaveBeenCalledWith(MOCK_ROOM_INFO);
      expect(dialogRefSpy).toHaveBeenCalled();
  });

  it('onCreate should call room function createRoom and dialogRef function close', () => {
      component.form.controls.room.setValue(MOCK_ROOM_INFO.roomName);
      const roomService: RoomService = TestBed.inject(RoomService);
      const createRoomSpy: jasmine.Spy = spyOn(roomService, 'createRoom');
      const dialogRefSpy: jasmine.Spy = spyOn(component.dialogRef, 'close').and.callThrough();
      component.onCreate();
      expect(createRoomSpy).toHaveBeenCalledWith(MOCK_ROOM_INFO.roomName);
      expect(dialogRefSpy).toHaveBeenCalled();
  });

  it('onCancel should call dialogRef function close', () => {
      const dialogRefSpy: jasmine.Spy = spyOn(component.dialogRef, 'close').and.callThrough();
      component.onCancel();
      expect(dialogRefSpy).toHaveBeenCalled();
  });

  it('initializeRoomListerner should subscribe on room function initializeRoomList and set variable properly', () => {
      const roomService: RoomService = TestBed.inject(RoomService);
      const initializeRoomSpy: jasmine.Spy = spyOn(roomService, 'initializeRoomList').and.returnValue(of(MOCK_ROOM));
      component.initializeRoomListerner();
      expect(initializeRoomSpy).toHaveBeenCalled();
      expect(component.roomList).toEqual(MOCK_ROOM.rooms);
      expect(component.filteredRoomList).toEqual(MOCK_ROOM.rooms);
      expect(component.fetchedList).toBe(true);
  });

});
