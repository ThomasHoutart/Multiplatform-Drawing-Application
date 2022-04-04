import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventEmitterService } from 'src/app/services/event-emitter/event-emitter.service';
import { EventObserver } from 'src/app/model/event/event-observer/event-observer';
import { ChatMessageSentEvent, SystemChatEvent } from 'src/app/model/event/events';
import { UserService } from 'src/app/services/user/user.service';
import { EMPTY, TYPE_RECEIVER, TYPE_SENDER, TYPE_SYSTEM } from './constant';
import { ChatMessage, ChatMessageDesktop } from 'src/app/models/interface/chat-message-desktop';
import { RoomService } from 'src/app/services/room/room.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { GameService } from 'src/app/services/game/game.service';
import { RoomMessage } from 'src/app/models/interface/room-info';
import { LobbyService } from 'src/app/services/lobby/lobby.service';
import { SoundsService } from 'src/app/services/sounds/sounds.service';
import { AvatarService } from 'src/app/services/avatar/avatar.service';
import { AntiCheatService } from 'src/app/services/anti-cheat/anti-cheat.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {


    @ViewChild('theChat') div: ElementRef;
    @ViewChild('message') messageInput: ElementRef;
    form: FormGroup;
    private messageReceived: EventObserver;
    private systemMessageReceived: EventObserver;
    private chatRoomNavigation: Subscription;
    private createRoom: Subscription;
    private deleteRoom: Subscription;
    private joinRoom: Subscription;
    private leaveRoom: Subscription;
    public isRoomOn: boolean;
    public showGetHistoryButton = true;
    public showPortal = false;
    public disableScrollMessageUpdate: boolean;

    constructor(
        public el: ElementRef,
        private formBuilder: FormBuilder,
        private emitterService: EventEmitterService,
        public user: UserService,
        private room: RoomService,
        private lobby: LobbyService,
        public dialog: MatDialog,
        public game: GameService,
        private sounds: SoundsService,
        private avatar: AvatarService,
        private antiCheat: AntiCheatService) {
        this.isRoomOn = false;
        this.disableScrollMessageUpdate = false;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public onScroll(event: any): void {
        if (event.srcElement.scrollHeight - Math.round(event.srcElement.scrollTop) - 50 < event.srcElement.clientHeight) {
            this.disableScrollMessageUpdate = false;
        } else {
            this.disableScrollMessageUpdate = true;
        }
    }

    public canPlayerWrite(): boolean {
        if (this.user.status.isSpectator) {
            if (!this.lobby.inLobby) {
                return false;
            }
        } else if (this.game.isGame) {
            if (this.game.isUserDrawing || this.antiCheat.chatIsBlocked) {
                return false;
            }
        }

        return true
    }

    public showChannelHistory(): void {
        this.showGetHistoryButton = false;
    }

    public makeChatMessage(): ChatMessage {
        return {
            content: this.form.get('message').value,
            author: EMPTY,
            timestamp: EMPTY,
            roomName: this.room.currentRoom,
        } as ChatMessage;
    }

    public sendMessage(): void {
        if (this.form.get('message').value != null) {
            if ((this.form.get('message').value.trim()).length > 0 && this.form.valid) {
                const messageContent: ChatMessage = this.makeChatMessage();
                this.emitterService.emit(new ChatMessageSentEvent(messageContent));
                this.form.reset();
            }
        }


        this.messageInput.nativeElement.focus();
    }

    public messageHandler(messageContent: ChatMessageDesktop): void {
        this.room.addMessage(messageContent);
    }

    public openRoomComponent(): void {
        this.dialog.open(ChatRoomComponent, {
            data: {},
        });
    }

    public listenToSystemMessages(): void {
        this.systemMessageReceived = new EventObserver((chatEvent: SystemChatEvent) => {
            const messageContent: ChatMessageDesktop = {
                chatMessage: chatEvent.content as ChatMessage,
                type: TYPE_SYSTEM
            };
            this.messageHandler(messageContent);
            this.div.nativeElement.scrollTop = this.div.nativeElement.scrollHeight;
        });
        this.emitterService.subscribe('SystemChatMessageReceived', this.systemMessageReceived);
    }

    public listenToUserMessages(): void {
        this.messageReceived = new EventObserver((chatEvent: any) => {
            const chatMessage = chatEvent.content as ChatMessage;
            chatMessage.timestamp = chatMessage.timestamp.substr(16, 8);
            const messageContent: ChatMessageDesktop = {
                chatMessage,
                type: chatMessage.author === this.user.getUsername() ? TYPE_SENDER : TYPE_RECEIVER
            };
            this.messageHandler(messageContent);
            if (chatMessage.author === this.user.getUsername() && this.game.isGame === true && this.lobby.inLobby === false)
                this.antiCheat.antiCheatSystem();
            if (chatMessage.author != this.user.getUsername() && chatMessage.roomName == this.room.currentRoom)
                this.sounds.playMessagReceived();
        }); this.emitterService.subscribe('ChatMessageReceived', this.messageReceived);
    }

    public listenToChatRoomNavigation(): void {
        this.chatRoomNavigation = this.room.chatRoomNavigationUpdate().subscribe((isRoomOn: boolean) => {
            this.isRoomOn = isRoomOn;
            this.div.nativeElement.scrollTop = this.div.nativeElement.scrollHeight
        });
    }

    public createRoomListener(): void {
        this.createRoom = this.room.createRoomListener().subscribe((room: RoomMessage) => {
            this.room.createRoomLogic(room);
        })
    }

    public deleteRoomListener(): void {
        this.deleteRoom = this.room.deleteRoomListener().subscribe((room: RoomMessage) => {
            this.room.deleteRoomLogic(room);
        })
    }

    public joinRoomListener(): void {
        this.joinRoom = this.room.joinRoomListener().subscribe((room: RoomMessage) => {
            this.room.joinRoomLogic(room);
        })
    }

    public leaveRoomListener(): void {
        this.leaveRoom = this.room.leaveRoomListener().subscribe((room: RoomMessage) => {
            this.room.leaveRoomLogic(room);
        })
    }

    public listen(): void {
        this.createRoomListener();
        this.joinRoomListener();
        this.leaveRoomListener();
        this.deleteRoomListener();
        this.listenToSystemMessages();
        this.listenToUserMessages();
        this.listenToChatRoomNavigation();
    }

    public terminate(): void {
        this.createRoom.unsubscribe();
        this.deleteRoom.unsubscribe();
        this.joinRoom.unsubscribe();
        this.leaveRoom.unsubscribe();
        this.chatRoomNavigation.unsubscribe();
        this.emitterService.unsubscribe('ChatMessageReceived', this.messageReceived);
        this.emitterService.unsubscribe('SystemChatMessageReceived', this.systemMessageReceived);
    }

    public ngOnInit(): void {
        this.form = this.formBuilder.group({
            message: ['', [Validators.required, Validators.maxLength(140)]],
        });
        this.listen();
    }

    public ngOnDestroy(): void {
        this.terminate();
    }

    public ngAfterViewChecked(): void {
        if (!this.disableScrollMessageUpdate) {
            this.div.nativeElement.scrollTop = this.div.nativeElement.scrollHeight;
        }
    }
}
