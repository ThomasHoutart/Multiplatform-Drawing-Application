/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { SocketIoModule } from 'ngx-socket-io';
import { AppModule } from 'src/app/app.module';
import { RoomService } from './room.service';
import { NgModule } from '@angular/core';
import { RoomInfo, RoomMessage } from 'src/app/models/interface/room-info';
import { ChatMessageDesktop } from 'src/app/models/interface/chat-message-desktop';
import { UserService } from '../user/user.service';

describe('RoomService', () => {
    let service: RoomService;
    let sendMessageSpy: jasmine.Spy<(room: ChatMessageDesktop[]) => void>;
    let updateMessageCounterSpy: jasmine.Spy<any>;
    let joinRoomSpy: jasmine.Spy<(room: RoomMessage) => void>;
    let deleteRoomSpy: jasmine.Spy<any>;
    let removeRoomSpy: jasmine.Spy<any>;
    let initializeRoomSpy: jasmine.Spy<() => void>;
    let initializeRoomContentArraySpy: jasmine.Spy<any>;

  @NgModule({
      imports: [
          AppModule,
      ],
  })
    class DialogTestModule { }

  beforeEach(() => {
      TestBed.configureTestingModule({
          imports: [DialogTestModule],
          providers: [SocketIoModule, UserService]
      });
      service = TestBed.inject(RoomService);
  });

  it('should be created', () => {
      expect(service).toBeTruthy();
  });

  it('should initialize the data of the room and assign the current room to "General"', () => {
      const roomInfo: RoomInfo = { creator: 'maxime', roomName: 'test' };
      const initRoomInfoList: RoomInfo[] = [{ creator: '', roomName: 'General' }];
      service.currentRoom = 'test';
      service.roomList = [roomInfo];
      service.initializeRoomData();
      expect(service.currentRoom).toEqual('General');
      expect(service.roomList).toEqual(initRoomInfoList);
  });
  it('Should clear the counter of the rooom at the right index.', () => {

      const mockRoomInfoList: RoomInfo[] = [{ creator: '', roomName: 'General' }];
      service.roomNewMessageCounter = [6, 2, 3, 3];
      service.roomList = mockRoomInfoList;
      service;

      service.clearCounter('General');

      expect(service.roomNewMessageCounter[0]).toEqual(0);
  });
  it('Should join the room with the right room infos, change the currentRoom of the user and push it to the room list if it doesnt contain it.', () => {

      // ajouter des verifs au niveau du websock

      const mockRoomInfoList: RoomInfo[] = [{ creator: '', roomName: 'General' }];
      const mockRoomInfo: RoomInfo = { creator: 'maxime', roomName: 'Room1' };
      service.currentRoom = 'General';
      service.roomList = mockRoomInfoList;

      service.joinRoom(mockRoomInfo);

      expect(service.roomList).toContain(mockRoomInfo);
      expect(service.currentRoom).toEqual('Room1');
  });
  it('Should not delete but leave the room with the right name at the right index if the user left the room', () => {
      const mockRoomInfoList: RoomInfo[] = [{ creator: '', roomName: 'General' }, { creator: 'maxime', roomName: 'Room1' }, { creator: 'michel', roomName: 'Room2' }];
      deleteRoomSpy = spyOn<any>(service, 'deleteRoom');
      removeRoomSpy = spyOn<any>(service, 'removeRoom');
      service.roomList = mockRoomInfoList;

      service.leaveRoom('Room1');

      expect(removeRoomSpy).toHaveBeenCalledWith(1);
      expect(deleteRoomSpy).not.toHaveBeenCalled();
  });
  it('Should not delete room with the right name and the right index if the user left the room called: General', () => {
      const mockRoomInfoList: RoomInfo[] = [{ creator: '', roomName: 'General' }, { creator: 'maxime', roomName: 'Room1' }, { creator: 'michel', roomName: 'Room2' }];
      deleteRoomSpy = spyOn<any>(service, 'deleteRoom');
      removeRoomSpy = spyOn<any>(service, 'removeRoom');
      service.roomList = mockRoomInfoList;

      service.leaveRoom('General');

      expect(removeRoomSpy).not.toHaveBeenCalled();
      expect(deleteRoomSpy).not.toHaveBeenCalled();
  });
  it('Should delete and leave the room with the right name at the right index if the user is the creator of the room', () => {
      const mockRoomInfoList: RoomInfo[] = [{ creator: '', roomName: 'General' }, { creator: 'maxime', roomName: 'Room1' }, { creator: 'michel', roomName: 'Room2' }];
      deleteRoomSpy = spyOn<any>(service, 'deleteRoom');
      removeRoomSpy = spyOn<any>(service, 'removeRoom');
      service.roomList = mockRoomInfoList;

      service.leaveRoom('Room1');

      expect(removeRoomSpy).toHaveBeenCalledWith(1);
      expect(deleteRoomSpy).toHaveBeenCalledWith('Room1');
  });

  it('should create the new room with the right name and push it to the room list than join it with the right parameters and added to the room list"', () => {
      const correctRoomInfo: RoomInfo = { creator: 'maxime', roomName: 'Room1' };
      joinRoomSpy = spyOn(service, 'joinRoom');

      service.createRoom('Room1');

      expect(service.roomList).toContain(correctRoomInfo);
      expect(joinRoomSpy).toHaveBeenCalledWith(correctRoomInfo);
  });

  it('should add a message system when the author is system in the right room and update message counter was not called', () => {
      sendMessageSpy = spyOn(service, 'sendRoomMessages');
      updateMessageCounterSpy = spyOn<any>(service, 'updateMessageCounter');
      const mockChatMessageDesktop: ChatMessageDesktop = {
          chatMessage: {
              author: 'system',
              content: 'adsa',
              roomName: 'General',
              timestamp: '1:00',
              avatar: 1,
          }, type: 1
      };

      service.addMessage(mockChatMessageDesktop);

      expect(sendMessageSpy).toHaveBeenCalled();
      expect(updateMessageCounterSpy).not.toHaveBeenCalled();
      // verifier que cest aussi la bonne room... le room content est private rip
  });

  it('should add a message in the current room of the user if the message is sent to the room of the user', () => {
      sendMessageSpy = spyOn(service, 'sendRoomMessages');
      updateMessageCounterSpy = spyOn<any>(service, 'updateMessageCounter');
      const currentRoom = 'General';
      const mockChatMessageDesktop: ChatMessageDesktop = {
          chatMessage: {
              author: 'Maxime',
              content: 'adsa',
              roomName: currentRoom,
              timestamp: '1:00',
              avatar: 3,
          }, type: 1
      };

      service.addMessage(mockChatMessageDesktop);

      expect(updateMessageCounterSpy).not.toHaveBeenCalled();
      expect(sendMessageSpy).toHaveBeenCalled();

  });
  it('should add a message in the current room of the user if the message is sent to the room of the user', () => {
      sendMessageSpy = spyOn(service, 'sendRoomMessages');
      updateMessageCounterSpy = spyOn<any>(service, 'updateMessageCounter');
      service.currentRoom = 'General';
      const mockChatMessageDesktop: ChatMessageDesktop = {
          chatMessage: {
              author: 'Maxime',
              content: 'adsa',
              roomName: service.currentRoom,
              timestamp: '1:00',
              avatar: 7,
          }, type: 1
      };

      service.addMessage(mockChatMessageDesktop);

      expect(updateMessageCounterSpy).not.toHaveBeenCalled();
      expect(sendMessageSpy).toHaveBeenCalled();

  });

  it('should not add a message in the current room of the user if the message is sent to another room  than the room of the user', () => {
      sendMessageSpy = spyOn(service, 'sendRoomMessages');
      updateMessageCounterSpy = spyOn<any>(service, 'updateMessageCounter');
      service.currentRoom = 'Room1';
      const mockChatMessageDesktop: ChatMessageDesktop = {
          chatMessage: {
              author: 'Maxime',
              content: 'adsa',
              roomName: service.currentRoom,
              timestamp: '1:00',
              avatar: 6,
          }, type: 1
      };

      service.addMessage(mockChatMessageDesktop);

      expect(updateMessageCounterSpy).toHaveBeenCalled();
      expect(sendMessageSpy).not.toHaveBeenCalled();

  });
  it('should send messages to the current room of the user on update message list', () => {
      service.currentRoom = 'General';
      const mockRoomContent: ChatMessageDesktop[][] = [[{
          chatMessage: {
              author: 'Maxime',
              content: 'adsa',
              roomName: service.currentRoom,
              timestamp: '1:00',
              avatar: 6,
          }, type: 1
      }, {

          chatMessage: {
              author: 'Maxime',
              content: 'adsa',
              roomName: 'General',
              timestamp: '1:01',
              avatar: 3,
          }, type: 1
      }]];

      const correctInput: ChatMessageDesktop[] = [{
          chatMessage: {
              author: 'Maxime',
              content: 'adsa',
              roomName: 'General',
              timestamp: '1:00',
              avatar: 3,
          }, type: 1
      }, {

          chatMessage: {
              author: 'Maxime',
              content: 'adsa',
              roomName: 'General',
              timestamp: '1:01',
              avatar: 3,
          }, type: 1
      }];

      sendMessageSpy = spyOn(service, 'sendRoomMessages');
      service['roomContent'] = mockRoomContent;

      service.updateMessageList();

      expect(sendMessageSpy).toHaveBeenCalledWith(correctInput);
  });

  it('should update the room searchlist with only with the one with the word in the filter', () => {
      const initRoomInfoList: RoomInfo[] = [{ creator: '', roomName: 'Room' }, { creator: '', roomName: 'General' }];
      const word = 'Room';

      expect(service.updateRoomSearchList(initRoomInfoList, word)).toEqual([{ creator: '', roomName: 'Room' }]);

  });

  it('should initialise the data on reset room', () => {
      initializeRoomContentArraySpy = spyOn<any>(service, 'initializeRoomContentArray');
      initializeRoomSpy = spyOn(service, 'initializeRoomData');

      service.resetRoom();

      expect(initializeRoomContentArraySpy).toHaveBeenCalled();
      expect(initializeRoomSpy).toHaveBeenCalled();
  });

});
