import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { EventObserver } from 'src/app/model/event/event-observer/event-observer';
import { ChatEvent, SystemChatEvent, ChatMessageSentEvent } from 'src/app/model/event/events';
import { RoomMessage } from 'src/app/models/interface/room-info';
// import { Observable, Subject } from 'rxjs';
// import { TYPE_RECEIVER } from 'src/app/components/chat/constant';
// import { ChatMessageDesktop } from 'src/app/models/interface/chat-message-desktop';
import { ChatMessage } from '../../../models/interface/chat-message-desktop';
import { EventEmitterService } from '../../event-emitter/event-emitter.service';

@Injectable({
    providedIn: 'root'
})
export class ChatSocketHandlerService {
  private sentMessageObserver: EventObserver;

  constructor(
    private socket: Socket,
    private eventEmitter: EventEmitterService
  ) {

  }

  private sendMessage(chatMessage: ChatMessage): void {
  	this.socket.emit('ChatMessage', chatMessage);
  }

  private listenToSentMessages(): void {
  	this.sentMessageObserver = new EventObserver((chatMessageSentEvent: ChatMessageSentEvent) => {
  		this.sendMessage(chatMessageSentEvent.content); });
  	this.eventEmitter.subscribe('ChatMessageSent', this.sentMessageObserver);
  }

  private listenToReceivedMessages(): void {
  	this.socket.on('ChatMessage', (chatMessage: ChatMessage) => {
  		this.eventEmitter.emit(new ChatEvent(chatMessage));
  	});
  }

  private listenToUserLogin(): void {
  	this.socket.on('JoinRoom', (message: RoomMessage) => {
  		const msg = {
  			author: 'system',
  			content: message.username + ' joined the room',
  			timestamp: '',
  			roomName: message.roomName
  		} as ChatMessage;
  		this.eventEmitter.emit(new SystemChatEvent(msg));
  	});
  }

  private listenToUserLogout(): void {
  	this.socket.on('LeaveRoom', (message: RoomMessage) => {
  		const msg = {
  			author: 'system',
  			content: message.username + ' left the room',
  			timestamp: '',
  			roomName: message.roomName
  		} as ChatMessage;
  		this.eventEmitter.emit(new SystemChatEvent(msg));
  	});
  }

  public listen(): void {
  	this.listenToSentMessages();
  	this.listenToReceivedMessages();
  	this.listenToUserLogin();
  	this.listenToUserLogout();
  }

  public chatRemoveListeners(): void {
  	this.socket.removeListener('ChatMessage');
  }
}
