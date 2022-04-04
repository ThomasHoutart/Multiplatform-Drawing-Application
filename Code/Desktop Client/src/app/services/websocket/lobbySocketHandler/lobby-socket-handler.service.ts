import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';
import { Lobby, LobbyUserList } from 'src/app/models/interface/lobby';

@Injectable({
    providedIn: 'root'
})
export class LobbySocketHandlerService {

    socketLobbyUpdate: Subject<Lobby>;
    socketLobbyInfo: Subject<LobbyUserList>;
    socketJoinLobby: Subject<Lobby>;
    socketLeaveLobby: Subject<Lobby>;
    socketDeleteLobby: Subject<Lobby>;
    socketCreateLobby: Subject<Lobby>;
    socketStartGame: Subject<Lobby>;
    socketError: Subject<any>;

    constructor(private socket: Socket) {
        this.socketLobbyUpdate = new Subject<Lobby>();
        this.socketLobbyInfo = new Subject<LobbyUserList>();
        this.socketJoinLobby = new Subject<Lobby>();
        this.socketLeaveLobby = new Subject<Lobby>();
        this.socketDeleteLobby = new Subject<Lobby>();
        this.socketCreateLobby = new Subject<Lobby>();
        this.socketStartGame = new Subject<Lobby>();
        this.socketError = new Subject<any>();
    }

    public sendLobbyCreation(lobbyInfo: Lobby): void {
  	this.socket.emit('CreateLobby', lobbyInfo);
    }

    public joinLobbyAsPlayer(lobbyInfo: Lobby): void {
  	this.socket.emit('JoinLobbyPlayer', lobbyInfo);
    }

    public joinLobbyAsSpectator(lobbyInfo: Lobby): void {
  	this.socket.emit('JoinLobbySpectator', lobbyInfo);
    }

    public leaveLobbyAsPlayer(): void {
  	this.socket.emit('LeaveLobbyPlayer');
    }

    public leaveLobbyAsSpectator(): void {
  	this.socket.emit('LeaveLobbySpectator');
    }

    public kickPlayer(username: string): void {
        this.socket.emit('KickPlayer', {username: username});
    }

    public addBot(): void {
        this.socket.emit('AddBot');
    }

    public deleteLobby(): void {
        this.socket.emit('DeleteLobby');
    }
  
    public startGame(): void {
  	this.socket.emit('StartGame');
    }

    public onStartGame(): void {
        this.socket.on('StartGame', (lobby: any) => {
            if (lobby.gameName) {
                this.socketStartGame.next(lobby);
            } else {
                this.socketError.next(lobby);
            }
        });
    }

    public onJoinLobbyPlayer(): void {
        this.socket.on('JoinLobbyPlayer', (lobby: any) => {
            if (lobby.gameName) {
                lobby.isSpectator = false;
                this.socketJoinLobby.next(lobby);
            } else {
                this.socketError.next(lobby);
            }
  	  });
    }

    public onJoinLobbySpectator(): void {
  	  this.socket.on('JoinLobbySpectator', (lobby: any) => {
            if (lobby.gameName) {
                lobby.isSpectator = true;
                this.socketJoinLobby.next(lobby);
            } else {
                this.socketError.next(lobby);
            }
  	  });
    }

    public onLeaveLobbyPlayer(): void {
        this.socket.on('LeaveLobbyPlayer', (lobby: any) => {
            if (lobby.username) {
                this.socketLeaveLobby.next(lobby);
            } else {
                this.socketError.next(lobby);
            }
  	  });
    }

    public onLeaveLobbySpectator(): void {
  	  this.socket.on('LeaveLobbySpectator', (lobby: any) => {
            if (lobby.username) {
                this.socketLeaveLobby.next(lobby);
            } else {
                this.socketError.next(lobby)
            }
  	  });
    }

    public onDeleteLobby(): void {
  	  this.socket.on('DeleteLobby', (lobby: any) => {
            if (lobby.gameName) {
                this.socketDeleteLobby.next(lobby);
            } else {
                this.socketError.next(lobby)
            }
  	  });
    }

    public onCreateLobby(): void {
  	  this.socket.on('CreateLobby', (lobby: any) => {
            if (lobby.gameName) {
                lobby.isSpectator = false;
                this.socketCreateLobby.next(lobby);
            } else {
                this.socketError.next(lobby)
            }
  	  });
    }

    public onLobbyInfo(): void {
        this.socket.on('LobbyInfo', (lobby: LobbyUserList) => {
  		  this.socketLobbyInfo.next(lobby);
  	  });
    }

    public onLobbyUpdate(): void {
  	  this.socket.on('UpdateLobby', (lobby: any) => {
  		  this.socketLobbyUpdate.next(lobby);
  	  });
    }

    public getStartGame(): Observable<Lobby> {
        return this.socketStartGame.asObservable();
    }

    public getLobbyInfo(): Observable<any> {
        return this.socketLobbyInfo.asObservable();
    }

    public getLobbyUpdate(): Observable<Lobby> {
        return this.socketLobbyUpdate.asObservable()
    }

    public getJoinUpdate(): Observable<Lobby> {
        return this.socketJoinLobby.asObservable();
    }

    public getLeaveUpdate(): Observable<Lobby> {
        return this.socketLeaveLobby.asObservable();
    }

    public getCreateUpdate(): Observable<Lobby> {
        return this.socketCreateLobby.asObservable();
    }

    public getDeleteUpdate(): Observable<Lobby> {
        return this.socketDeleteLobby.asObservable();
    }

    public getErrorUpdate(): Observable<any> {
        return this.socketError.asObservable();
    }

    listen(): void {
        this.onLobbyInfo();
        this.onLobbyUpdate();
        this.onJoinLobbyPlayer();
        this.onJoinLobbySpectator();
        this.onLeaveLobbyPlayer();
        this.onLeaveLobbySpectator();
        this.onCreateLobby();
        this.onDeleteLobby();
        this.onStartGame();
    }


}
