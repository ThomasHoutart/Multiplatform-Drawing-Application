import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { RoomService } from 'src/app/services/room/room.service';
import { ChildWindowHandlerService } from 'src/app/services/child-window-handler/child-window-handler.service';
import { ChatMessage } from 'src/app/models/interface/chat-message-desktop';
import { GameService } from 'src/app/services/game/game.service';
import { LobbyService } from 'src/app/services/lobby/lobby.service';
import { Lobby } from 'src/app/models/interface/lobby';
import { UserService } from 'src/app/services/user/user.service';

@Component({
    selector: 'app-chat-nav',
    templateUrl: './chat-nav.component.html',
    styleUrls: ['./chat-nav.component.css']
})
export class ChatNavComponent implements OnInit, OnDestroy {

  public chatIntegrate = true;
  public changeRoomView = false;
  public chatRoomNavigationSubscription: Subscription;
  public roomName: string;
  public chatState = 'INTEGRATED';
  public isJoinedRoomPage: boolean;
  private joiningRoom: Subscription;
  private leaveLobby: Subscription;
  private leaveGame: Subscription;

  constructor(
	  public room: RoomService, 
	  public windowHandler: ChildWindowHandlerService,
	  public game: GameService,
	  public lobby: LobbyService,
	  public user: UserService) {
  	this.roomName = 'General';
  	this.isJoinedRoomPage = false;
  }
  
  onBack(): void {
  	this.room.ChatRoomNavigationSet(false);
  	this.roomName = this.roomNameFilter(this.room.currentRoom);
  	this.isJoinedRoomPage = false;
  	this.changeRoomView = false;
  	this.room.isInRoom = true;
  }

  roomNameFilter(name: string): string {
	  if (name.substr(0, 6) === 'Lobby:') {
		  return name.substr(6);
	  }

	  return name;
  }

  onChangeRoom(): void {
  	this.room.ChatRoomNavigationSet(true);
  	this.roomName = 'Joined Room';
  	this.isJoinedRoomPage = true;
  	this.changeRoomView = true;
  	this.room.isInRoom = false;
  }

  onJoiningRoom(): void {
  	this.joiningRoom = this.room.joinRoomUpdate().subscribe(() => {
  		this.onBack();
  	});
  }

  onHistory(): void {
  	this.room.getMessageHistory().subscribe((msg: any) => {
  		const messagesList: ChatMessage[] = msg.messageHistory.reverse();
		  this.room.addHistoryMessage(messagesList);
		  try {
              this.room.updateHistoryMessageId(messagesList[messagesList.length-1]._id);
		  } catch(e) {
              return;
		  }
  	});
  }

  onLeaveLobby(): void {
      this.leaveLobby = this.lobby.lobbyLeaveListeners().subscribe((lobby: Lobby) => {
          if (this.user.getUsername() === lobby.username) {
			  this.room.currentRoom = 'General'
			  this.roomName = this.room.currentRoom ;
			  this.room.updateMessageList();
			  this.onBack();
          }
      })
  }

  onLeaveGame(): void {
	  this.leaveGame = this.game.leaveGameListener().subscribe((username: string) => {
          if (this.user.getUsername() === username) {
              this.room.currentRoom = 'General'
              this.roomName = this.room.currentRoom;
              this.room.updateMessageList();
              this.onBack();
          }
      })
  }
  
  moveChatBox(): void {
  	this.windowHandler.openChatWindow();
  	if (this.chatState === 'INTEGRATED'){
  		this.windowHandler.changeChatState('WINDOWED');
  	} else {
  		this.windowHandler.changeChatState('INTEGRATED');
  	}
  } 

  ngOnInit(): void {
	  this.onJoiningRoom();
	  this.onLeaveLobby();
	  this.onLeaveGame();
  	this.windowHandler.currentChatState.subscribe(chatState => this.chatState = chatState);
  }

  ngOnDestroy(): void {
	  this.joiningRoom.unsubscribe();
	  this.leaveLobby.unsubscribe();
	  this.leaveGame.unsubscribe();
  }
}
