import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatMessageDesktop } from 'src/app/models/interface/chat-message-desktop';
import { AvatarService } from 'src/app/services/avatar/avatar.service';
import { RoomService } from 'src/app/services/room/room.service';

@Component({
    selector: 'app-chat-message-list',
    templateUrl: './chat-message-list.component.html',
    styleUrls: ['./chat-message-list.component.css']
})

export class ChatMessageListComponent implements OnInit, OnDestroy {

  public messageList: ChatMessageDesktop[];
  public roomIndex: number;
  private messageListChange: Subscription;

  constructor(private room: RoomService, public avatar: AvatarService) {
  	this.roomIndex = 0;
  }

  listenToRoomMessagesUpdate(): void {
  	this.messageListChange = this.room.getRoomMessages().subscribe((messageList: ChatMessageDesktop[]) => {
  		this.messageList = messageList;
      });
  
  	this.room.updateMessageList();
  }

  ngOnInit(): void {
  	this.listenToRoomMessagesUpdate();
  }

  ngOnDestroy(): void {
  	this.messageListChange.unsubscribe();
  }
}
