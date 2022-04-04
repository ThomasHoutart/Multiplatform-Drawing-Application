/* eslint-disable max-lines-per-function */
import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AppModule } from 'src/app/app.module';
import { ChatMessage } from 'src/app/models/interface/chat-message-desktop';
import { DIALOG_MOCK } from 'src/app/models/mock/dialog';
import { EventEmitterService } from 'src/app/services/event-emitter/event-emitter.service';
import { RoomService } from 'src/app/services/room/room.service';
import { ChatComponent } from './chat.component';
import { DEFAULT_SENT_MESSAGE, EMPTY, MOCK_DESKTOP_CHAT_MESSAGE } from './constant';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;

  @NgModule({
      imports: [
          AppModule,
      ],
  })
    class DialogTestModule { }

  beforeEach(async () => {
      await TestBed.configureTestingModule({
          imports: [ DialogTestModule ],
          declarations: [ ChatComponent ],
          providers: [
              {provide: MatDialogRef, useValue: DIALOG_MOCK},
          ]
      })
          .compileComponents();
  });

  beforeEach(() => {
      fixture = TestBed.createComponent(ChatComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
  });

  it('should create', () => {
      expect(component).toBeTruthy();
  });

  it('showChannelHistory should set showGetHistoryButton to false', () => {
      component.showChannelHistory();
      expect(component.showGetHistoryButton).toBe(false);
  });

  it('makeChatMessage should return chatMessage', () => {
      component.form.controls.message.setValue(DEFAULT_SENT_MESSAGE.content);
      const roomService: RoomService = TestBed.inject(RoomService);
      roomService.currentRoom = DEFAULT_SENT_MESSAGE.roomName;
      const message: ChatMessage = component.makeChatMessage();
      expect(message.content).toBe(DEFAULT_SENT_MESSAGE.content);
      expect(message.author).toBe(EMPTY);
      expect(message.timestamp).toBe(EMPTY);
      expect(message.roomName).toBe(DEFAULT_SENT_MESSAGE.roomName);
  });

  it('sendMessage should create a new message, emit it and call reset once its done', () => {
      component.form.controls.message.setValue(DEFAULT_SENT_MESSAGE.content);
      const eventEmitterService: EventEmitterService = TestBed.inject(EventEmitterService);
      const makeChatMessageSpy: jasmine.Spy = spyOn(component, 'makeChatMessage');
      const emitterSpy: jasmine.Spy = spyOn(eventEmitterService, 'emit');
      const formSpy: jasmine.Spy = spyOn(component.form, 'reset');
      component.sendMessage();
      expect(makeChatMessageSpy).toHaveBeenCalled();
      expect(emitterSpy).toHaveBeenCalled();
      expect(formSpy).toHaveBeenCalled();
  });

  it('messageHandler should call room function addMessage', () => {
      const roomService: RoomService = TestBed.inject(RoomService);
      const roomSpy: jasmine.Spy = spyOn(roomService, 'addMessage');
      component.messageHandler(MOCK_DESKTOP_CHAT_MESSAGE);
      expect(roomSpy).toHaveBeenCalledWith(MOCK_DESKTOP_CHAT_MESSAGE);
  });

  it('openRoomComponent should call dialog function open', () => {
      const dialogSpy: jasmine.Spy = spyOn(component.dialog, 'open');
      component.openRoomComponent();
      expect(dialogSpy).toHaveBeenCalled();
  });

  it('listenToChatRoomNavigation should subscribre to chatRoomNavigationUpdate and set boolean isRoomOn to received value', () => {
      const roomService: RoomService = TestBed.inject(RoomService);
      const roomNavigationSpy: jasmine.Spy = spyOn(roomService, 'chatRoomNavigationUpdate').and.returnValue(of(true));
      component.listenToChatRoomNavigation();
      expect(roomNavigationSpy).toHaveBeenCalled();
      expect(component.isRoomOn).toBe(true);
  });
});
