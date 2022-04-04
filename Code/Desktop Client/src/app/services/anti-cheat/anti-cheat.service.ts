/* eslint-disable max-lines-per-function */
/* eslint-disable indent */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ChatMessage, ChatMessageDesktop } from 'src/app/models/interface/chat-message-desktop';
import { RoomService } from '../room/room.service';
import { RoutingService } from '../routing/routing.service';
import { GameSocketHandlerService } from '../websocket/gameSocketHandler/game-socket-handler.service';
import { LogoutSocketHandlerService } from '../websocket/logoutSocketHandler/logout-socket-handler.service';
import { FIRST_WARNING, GTFO_PLEASE, ANTI_SPAM_INTERVAL, LAST_WARNING, SECOND_WARNING, STRIKE_ONE, STRIKE_TWO } from './constant';

@Injectable({
    providedIn: 'root'
})
export class AntiCheatService {

    nbMessagesInInterval: number;
    antiSpamInterval: any;
    blockedInterval: any;
    chatIsBlocked: boolean;
    strikes: number;
    kickPlayer: Subject<void>

    constructor(private room: RoomService,
        private socket: GameSocketHandlerService,
        private routing: RoutingService,
        private logoutSocket: LogoutSocketHandlerService) {
        this.nbMessagesInInterval = 1;
        this.chatIsBlocked = false;
        this.strikes = 0;
        this.kickPlayer = new Subject<void>();
    }

    reset(): void {
        this.strikes = 0;
    }

    antiCheatMesage(message: string): ChatMessageDesktop {
        return {
            chatMessage: {
                content: message,
                author: 'system',
                timestamp: '',
                roomName: this.room.currentRoom
            } as ChatMessage,
            type: 2
        } as ChatMessageDesktop
    }

    antiCheatSystem(): void {
        if (!this.antiSpamInterval) {
            this.timer();
        } else {
            this.warningHandler();
        }
    }

    warningHandler(): void {
        this.nbMessagesInInterval += 1;
        switch (this.nbMessagesInInterval) {
            case 5: {
                this.room.addMessage(this.antiCheatMesage(FIRST_WARNING));
                break;
            }
            case 7: {
                this.room.addMessage(this.antiCheatMesage(SECOND_WARNING));
                break;
            }
            case 9: {
                this.room.addMessage(this.antiCheatMesage(LAST_WARNING));
                break;
            }
            case 10: {
                this.punishementTime();
                break;
            }
            default: break;
        }
    }

    punishementTime(): void {
        this.strikes += 1;
        switch (this.strikes) {
            case 1: {
                this.blockChat();
                this.room.addMessage(this.antiCheatMesage(STRIKE_ONE));
                break;
            }
            case 2: {
                this.chatIsBlocked = true;
                this.room.addMessage(this.antiCheatMesage(STRIKE_TWO));
                break;
            }
            case 3: {
                this.room.addMessage(this.antiCheatMesage(GTFO_PLEASE));
                this.socket.userCheated();
                this.logoutSocket.logout();
                this.routing.moveToLogin();
                break;
            }
            default: break;
        }
    }

    timer(): void {
        this.antiSpamInterval = setInterval(() => {
            this.nbMessagesInInterval = 1
            clearInterval(this.antiSpamInterval);
            this.antiSpamInterval = ''
        }, ANTI_SPAM_INTERVAL)
    }

    blockChat(): void {
        this.chatIsBlocked = true;
        this.blockedInterval = setInterval(() => {
            this.chatIsBlocked = false;
            clearInterval(this.blockedInterval);
        }, ANTI_SPAM_INTERVAL)
    }


}
