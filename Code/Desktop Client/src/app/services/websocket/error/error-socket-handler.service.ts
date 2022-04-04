import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';
import { BAD_PASSWORD_ERROR_MESSAGE, LOBBY_ALREADY_EXIST, LOBBY_DONT_EXIST_ERROR_MESSAGE, NOT_ENOUGH_PLAYER_ERROR_MESSAGE, ROOM_ALREADY_EXIST_ERROR_MESSAGE, ROOM_DOES_NOT_EXIST_ERROR_MESSAGE, USER_ALREADY_LOG_IN_ERROR_MESSAGE, USER_DOES_NOT_EXIST_ERROR_MESSAGE, USER_NOT_IN_ROOM_ERROR_MESSAGE } from './constant';

@Injectable({
    providedIn: 'root'
})
export class ErrorSocketHandlerService {

    loginErrorUpdate: Subject<string>;
    lobbyErrorUpdate: Subject<string>;

    constructor(private socket: Socket) {
        this.loginErrorUpdate = new Subject<string>();
        this.lobbyErrorUpdate = new Subject<string>();
    }

    onNotInRoomError(): void {
        this.socket.on('NotInRoomError', () => {
            (console).log(USER_NOT_IN_ROOM_ERROR_MESSAGE);
        })
    }

    onRoomDoesNotExistError(): void {
        this.socket.on('RoomDoesNotExistError', () => {
            (console).log(ROOM_DOES_NOT_EXIST_ERROR_MESSAGE);
        })
    }

    onRoomAlreadyExistsError(): void {
        this.socket.on('RoomAlreadyExistsError', () => {
            (console).log(ROOM_ALREADY_EXIST_ERROR_MESSAGE);
        })
    }

    onMaxRoomsJoinedError(): void {
        this.socket.on('MaxRoomsJoinedError', () => {
            (console).log(ROOM_ALREADY_EXIST_ERROR_MESSAGE);
        })
    }

    onAlreadyInRoomError(): void {
        this.socket.on('AlreadyInRoomError', () => {
            (console).log(ROOM_ALREADY_EXIST_ERROR_MESSAGE);
        })
    }

    roomError(): void {
        this.onNotInRoomError();
        this.onRoomDoesNotExistError();
        this.onRoomAlreadyExistsError();
        this.onMaxRoomsJoinedError();
        this.onAlreadyInRoomError();
    }

    onUserDoesNotExistError(): void {
        this.socket.on('UserDoesNotExistError', () => {
            this.loginErrorUpdate.next(USER_DOES_NOT_EXIST_ERROR_MESSAGE);
        })
    }

    onBadPasswordError(): void {
        this.socket.on('BadPasswordError', () => {
            this.loginErrorUpdate.next(BAD_PASSWORD_ERROR_MESSAGE);
        })
    }

    onUserAlreadyLoggedInError(): void {
        this.socket.on('UserAlreadyLoggedInError', () => {
            this.loginErrorUpdate.next(USER_ALREADY_LOG_IN_ERROR_MESSAGE);
        })
    }

    getLoginErrors(): Observable<string> {
        return this.loginErrorUpdate.asObservable();
    }

    loginError(): void {
        this.onUserDoesNotExistError();
        this.onBadPasswordError();
        this.onUserAlreadyLoggedInError();
    }

    onUserNotInLobbyError(): void {
        this.socket.on('UserNotInLobbyError', () => {
            this.lobbyErrorUpdate.next(USER_NOT_IN_ROOM_ERROR_MESSAGE);
        })
    }

    onLobbyDoesNotExistError(): void {
        this.socket.on('LobbyDoesNotExistError', () => {
            this.lobbyErrorUpdate.next(LOBBY_DONT_EXIST_ERROR_MESSAGE);
        })
    }

    onNotEnoughPlayersError(): void {
        this.socket.on('NotEnoughPlayersError', () => {
            this.lobbyErrorUpdate.next(NOT_ENOUGH_PLAYER_ERROR_MESSAGE);
        })
    }

    onLobbyAlreadyExistsError(): void {
        this.socket.on('LobbyAlreadyExistsError', () => {
            this.lobbyErrorUpdate.next(LOBBY_ALREADY_EXIST)
        })
    }

    getLobbyErrors(): Observable<string> {
        return this.lobbyErrorUpdate.asObservable();
    }

    lobbyError(): void {
        this.onLobbyAlreadyExistsError();
        this.onUserNotInLobbyError();
        this.onLobbyDoesNotExistError();
        this.onNotEnoughPlayersError();
    }


    listen(): void {
        this.roomError();
        this.loginError();
        this.lobbyError();
    }
}
