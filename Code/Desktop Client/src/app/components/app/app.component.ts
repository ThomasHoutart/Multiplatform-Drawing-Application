import { Component, OnDestroy, OnInit } from '@angular/core';
import { RoutingService } from 'src/app/services/routing/routing.service';
import { ChatSocketHandlerService } from 'src/app/services/websocket/chatSocketHandler/chat-socket-handler.service';
import { DrawingSocketHandlerService } from 'src/app/services/websocket/drawingSocketHandler/drawing-socket-handler.service';
import { ErrorSocketHandlerService } from 'src/app/services/websocket/error/error-socket-handler.service';
import { GameSocketHandlerService } from 'src/app/services/websocket/gameSocketHandler/game-socket-handler.service';
import { LobbySocketHandlerService } from 'src/app/services/websocket/lobbySocketHandler/lobby-socket-handler.service';
import { LogoutSocketHandlerService } from 'src/app/services/websocket/logoutSocketHandler/logout-socket-handler.service';
import { RoomSocketHandlerService } from 'src/app/services/websocket/roomSocketHandler/room-socket-handler.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'drawhub';

    constructor(
        private routing: RoutingService,
        private socket: LogoutSocketHandlerService,
        private chatSocketHandlerService: ChatSocketHandlerService,
        private gameSocketHandlerService: GameSocketHandlerService,
        private lobbySocketHandlerService: LobbySocketHandlerService,
        private drawingSocketHandlerService: DrawingSocketHandlerService,
        private roomSocketHandlerService: RoomSocketHandlerService,
        private errorSocketHandlerService: ErrorSocketHandlerService,
    ) { }

    ngOnInit(): void {
        this.routing.moveToLogin();
        this.chatSocketHandlerService.listen();
        this.gameSocketHandlerService.listen();
        this.lobbySocketHandlerService.listen();
        this.drawingSocketHandlerService.listen();
        this.roomSocketHandlerService.listen();
        this.errorSocketHandlerService.listen();
    }

    ngOnDestroy(): void {
        this.socket.logout();
    }
}
