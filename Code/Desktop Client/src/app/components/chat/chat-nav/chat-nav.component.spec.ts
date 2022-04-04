/*
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoomService } from 'src/app/services/room/room.service';
import { ChatNavComponent } from './chat-nav.component';
import { ChildWindowHandlerService } from  'src/app/services/child-window-handler/child-window-handler.service';
import { NgModule } from '@angular/core';
import { AppModule } from 'src/app/app.module';
import { of } from 'rxjs';
import { MOCK_STATE } from './constant';

class MockedRoomService extends RoomService {
  currentRoom = "Room1";
  onJoiningRoom(): void { }
}

fdescribe('ChatNavComponent', () => {
  let component: ChatNavComponent;
  let fixture: ComponentFixture<ChatNavComponent>;
  let childWindowService: ChildWindowHandlerService;
  let roomNavSpy: jasmine.Spy;
  let mockRoomService: MockedRoomService;
  let windowStateSpy: jasmine.Spy;

  @NgModule({
    imports: [
      AppModule,
    ],
  })
  class DialogTestModule { }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DialogTestModule ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    let joinRoomSpy = spyOn(component, 'onJoiningRoom');
    let windowSpy = spyOnProperty(component.windowHandler, 'currentChatState').and.returnValue(of(MOCK_STATE))
    //roomNavSpy = spyOn(roomService, 'ChatRoomNavigationSet');
    windowStateSpy = spyOn(childWindowService, 'changeChatState');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

 /*
  it('On back, it should return the user to to chat room selected', () => {
    component.roomName = "General";
    component.onBack();
    expect(component.isJoinedRoomPage).toBeFalse;
    expect(component.changeRoomView).toBeFalse;
    expect(roomNavSpy).toHaveBeenCalled();
    expect(component.roomName).toEqual("Room1");
  });

  it('On changeRoom, it should return the user to to chat room selected', () => {
    component.roomName = "General";
    component.onChangeRoom();
    expect(component.isJoinedRoomPage).toBeFalse;
    expect(component.changeRoomView).toBeFalse;
    expect(roomNavSpy).toHaveBeenCalled();
    expect(component.roomName).toEqual('Joined Room');
  });

  it('On moveChatBox, it should put the chatbox in windowed mode if it was in integrated mode at first', () => {
    component.roomName = "General";
    component.chatState = "INTEGRATED";
    component.moveChatBox();
    expect(windowStateSpy).toHaveBeenCalled();
  });
});
*/
