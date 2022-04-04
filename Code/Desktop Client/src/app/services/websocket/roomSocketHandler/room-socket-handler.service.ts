import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';
import { RoomMessage } from 'src/app/models/interface/room-info';

@Injectable({
    providedIn: 'root'
})
export class RoomSocketHandlerService {

    private joinRoomSub: Subject<RoomMessage>;
    private leaveRoomSub: Subject<RoomMessage>;
    private createRoomSub: Subject<RoomMessage>;
    private deleteRoomSub: Subject<RoomMessage>;

    constructor(
    private socket: Socket,
    ) {
        this.joinRoomSub = new Subject<RoomMessage>();
        this.leaveRoomSub = new Subject<RoomMessage>();
        this.createRoomSub = new Subject<RoomMessage>();
        this.deleteRoomSub = new Subject<RoomMessage>();
    }

    public joinRoom(room: string): void {
        this.socket.emit('JoinRoom', {roomName: room} as RoomMessage);
    }

    public createRoom(room: string): void {
        this.socket.emit('CreateRoom', {roomName: room} as RoomMessage);
    }

    public leaveRoom(room: string): void {
        this.socket.emit('LeaveRoom', {roomName: room} as RoomMessage);
    }

    public deleteRoom(room: string): void {
        this.socket.emit('DeleteRoom', {roomName: room} as RoomMessage);
    }

    public onCreateRoom(): void {
        this.socket.on('CreateRoom', (roomMessage: RoomMessage) => {
            this.createRoomSub.next(roomMessage);
        })
    }

    public onJoinRoom(): void {
        this.socket.on('JoinRoom', (roomMessage: RoomMessage) => {
            console.log(roomMessage)
            this.joinRoomSub.next(roomMessage);
        })
    }

    public onLeaveRoom(): void {
        this.socket.on('LeaveRoom', (roomMessage: RoomMessage) => {
            console.log(roomMessage)
            this.leaveRoomSub.next(roomMessage);
        })
    }

    public onDeleteRoom(): void {
        this.socket.on('DeleteRoom', (roomMessage: RoomMessage) => {
            this.deleteRoomSub.next(roomMessage);
        })
    }

    public getDeleteRoomUpdate(): Observable<RoomMessage> {
        return this.deleteRoomSub.asObservable();
    }

    public getLeaveRoomUpdate(): Observable<RoomMessage> {
        return this.leaveRoomSub.asObservable();
    }

    public getJoinRoomUpdate(): Observable<RoomMessage> {
        return this.joinRoomSub.asObservable();
    }

    public getCreateRoomUpdate(): Observable<RoomMessage> {
        return this.createRoomSub.asObservable();
    }

    public listen(): void {
        this.onCreateRoom();
        this.onDeleteRoom();
        this.onJoinRoom();
        this.onLeaveRoom();
    }
}
