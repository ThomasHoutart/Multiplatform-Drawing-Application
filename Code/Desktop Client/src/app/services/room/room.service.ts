import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SYSTEM, TYPE_RECEIVER, TYPE_SENDER } from 'src/app/components/chat/constant';
import { SERVER_LINK } from 'src/app/models/constant/drawing/constant';
import { ChatMessage, ChatMessageDesktop } from 'src/app/models/interface/chat-message-desktop';
import { Room, RoomInfo, RoomMessage } from 'src/app/models/interface/room-info';
import { UserService } from '../user/user.service';
import { RoomSocketHandlerService } from '../websocket/roomSocketHandler/room-socket-handler.service';

@Injectable({
    providedIn: 'root'
})
export class RoomService {
    public currentRoom: string;
    public roomList: RoomMessage[];
    public lastRoomMsgID: string[];
    public roomNewMessageCounter: number[];
    private roomContent: ChatMessageDesktop[][];
    private chatRoomNavigation: Subject<boolean>;
    private currentRoomMessages: Subject<ChatMessageDesktop[]>;
    private updateCounter: Subject<number[]>;
    public joiningRoom: Subject<void>;
    public isInRoom: boolean;
    private updateJoinedRoom: Subject<void>

    constructor(
        private roomSocket: RoomSocketHandlerService, private http: HttpClient, private user: UserService) {
        this.chatRoomNavigation = new Subject<boolean>();
        this.currentRoomMessages = new Subject<ChatMessageDesktop[]>();
        this.joiningRoom = new Subject<void>();
        this.updateCounter = new Subject<number[]>();
        this.updateJoinedRoom = new Subject<void>();
        this.isInRoom = true;
        this.initializeRoomData();
        this.initializeRoomContentArray();
    }

    public initializeRoomData(): void {
        this.currentRoom = 'General';
        this.roomList = [{
            creator: '',
            roomName: 'General'
        }];
    }

    private initializeRoomContentArray(): void {
        this.roomContent = [];
        this.roomNewMessageCounter = [];
        this.lastRoomMsgID = [];
        for (let i = 0; i < 15; i++) {
            this.roomContent.push([]);
            this.roomNewMessageCounter.push(0);
            this.lastRoomMsgID.push('');
        }
    }

    public getRoomIndex(roomName: string): number {
        for (let i = 0; i < this.roomList.length; i++) {
            if (this.roomList[i].roomName === roomName) {
                return i;
            }
        }
        return -1;
    }

    public initializeRoomList(isUser?: boolean): Observable<any> {
        return isUser ? this.http.get(SERVER_LINK + '/room/list/?user=' + this.user.getUsername()) :
            this.http.get(SERVER_LINK + '/room/list/');
    }

    public getMessageHistory(): Observable<any> {
        let params = new HttpParams();
        const messageId: string = this.lastRoomMsgID[this.getRoomIndex(this.currentRoom)];
        params = params.append('roomName', this.currentRoom);
        if (messageId !== '') {
            params = params.append('firstKnownId', messageId);
        } else if (this.roomContent[this.getRoomIndex(this.currentRoom)].length > 0) {
            const message: ChatMessage = this.findFirstUserMessage(this.roomContent[this.getRoomIndex(this.currentRoom)]);
            if (message.content) {
                params = params.append('firstKnownId', message._id);
            }
        }
        return this.http.get(SERVER_LINK + '/room/messagehistory/', { params });
    }

    findFirstUserMessage(list: ChatMessageDesktop[]): ChatMessage {
        for (const element of list) {
            if (element.chatMessage.author !== 'system') {
                return element.chatMessage;
            }
        }

        return { content: '' } as ChatMessage;
    }

    addHistoryMessage(messagesList: ChatMessage[]): void {
        for (const message of messagesList) {
            const desktopMessage: ChatMessageDesktop = {
                chatMessage: message,
                type: message.author === this.user.getUsername() ? TYPE_SENDER : TYPE_RECEIVER
            };
            desktopMessage.chatMessage.timestamp = message.timestamp.substr(16, 8);
            this.roomContent[this.getRoomIndex(this.currentRoom)].unshift(desktopMessage);
        }
    }

    updateHistoryMessageId(id: string): void {
        this.lastRoomMsgID[this.getRoomIndex(this.currentRoom)] = id;
    }

    public chatRoomNavigationUpdate(): Observable<boolean> {
        return this.chatRoomNavigation.asObservable();
    }

    public ChatRoomNavigationSet(isRoomSelect: boolean): void {
        this.chatRoomNavigation.next(isRoomSelect);
    }

    public getRoomMessages(): Observable<ChatMessageDesktop[]> {
        return this.currentRoomMessages.asObservable();
    }

    public sendRoomMessages(room: ChatMessageDesktop[]): void {
        this.currentRoomMessages.next(room);
    }

    public joinRoomUpdate(): Observable<void> {
        return this.joiningRoom.asObservable();
    }

    public getUpdateCounter(): Observable<number[]> {
        return this.updateCounter.asObservable();
    }

    public clearCounter(room: string): void {
        const index: number = this.getRoomIndex(room);
        if (index !== -1) {
            this.roomNewMessageCounter[index] = 0;
        }
    }

    public joinRoom(room: RoomMessage): void {
        this.roomSocket.joinRoom(room.roomName);
    }

    public filterRoom(room: Room): RoomInfo[] {
        return room.rooms.filter((element) => {
            return element.roomName.substr(0, 6) !== 'Lobby:';
        })
    }

    public joinRoomLogic(room: RoomMessage): void {
        if (this.getRoomIndex(room.roomName) === -1) {
            this.roomList.push(room);
        }
        if (room.username === this.user.getUsername()) {
            this.currentRoom = room.roomName;
            this.updateMessageList();
            this.joiningRoom.next();
            this.ChatRoomNavigationSet(false);
        }
    }

    public leaveRoom(room: string): void {
        const roomIndex = this.getRoomIndex(room);
        if (this.roomList[roomIndex].creator === this.user.getUsername()) {
            this.roomSocket.deleteRoom(room);
        } else {
            this.roomSocket.leaveRoom(room);
        }
    }

    leaveRoomLogic(room: RoomMessage): void {
        if (room.username === this.user.getUsername()) {
            const roomIndex = this.getRoomIndex(room.roomName);
            if (roomIndex !== -1 && room.roomName !== 'General') {
                this.removeRoom(roomIndex);
            }
            this.currentRoom = 'General'
        }
    }

    deleteRoomMessage(deletedRoom: string): ChatMessageDesktop {
        return {
            chatMessage: {
                author: SYSTEM,
                content: 'The room ' + deletedRoom.substr(6) + ' no longer exist. You have been moved back to the General chat.',
                timestamp: '',
                roomName: 'General'
            } as ChatMessage,
            type: 2
        } as ChatMessageDesktop
    }

    deleteRoomLogic(room: RoomMessage): void {
        const roomIndex = this.getRoomIndex(room.roomName);
        if (this.currentRoom === room.roomName) {
            const deletedRoom: string = this.currentRoom;
            this.currentRoom = 'General'
            this.joiningRoom.next();
            this.addMessage(this.deleteRoomMessage(deletedRoom));
        }
        if (roomIndex !== -1 && room.roomName !== 'General') {
            this.removeRoom(roomIndex);
        }
    }

    public updateJoinedRooms(): Observable<void> {
        return this.updateJoinedRoom.asObservable();
    }

    private removeRoom(index: number): void {
        this.roomList.splice(index, 1);
        this.roomContent.splice(index, 1);
        this.lastRoomMsgID.splice(index, 1);
        this.roomContent.push([]);
        this.lastRoomMsgID.push('');
        this.updateJoinedRoom.next();
    }

    public createRoom(room: string): void {
        this.roomSocket.createRoom(room);
    }

    createRoomLogic(room: RoomMessage): void {
        if (this.roomContent.length <= 15) {
            this.roomList.push(room);
            if (room.username === this.user.getUsername()) {
                this.currentRoom = room.roomName;
                this.updateMessageList();
                this.joiningRoom.next();
                this.ChatRoomNavigationSet(false);
            }
        } else {
            (console).log('too many rooms to create a new one')
        }
    }

    public addMessage(messageContent: ChatMessageDesktop): void {
        const roomIndex: number = this.getRoomIndex(messageContent.chatMessage.roomName);
        if (roomIndex !== -1) {
            this.roomContent[roomIndex].push(messageContent);
            if (messageContent.chatMessage.roomName === this.currentRoom) {
                this.sendRoomMessages(this.roomContent[roomIndex]);
            }
            if (!this.isInRoom || messageContent.chatMessage.roomName !== this.currentRoom) {
                this.updateMessageCounter(roomIndex);
            }
        }
    }

    private updateMessageCounter(roomIndex: number) {
        this.roomNewMessageCounter[roomIndex] += 1;
        this.updateCounter.next(this.roomNewMessageCounter);
    }

    public updateMessageList(): void {
        this.sendRoomMessages(this.roomContent[this.getRoomIndex(this.currentRoom)]);
    }

    public updateRoomSearchList(roomList: RoomMessage[], wordFilter: string): RoomMessage[] {
        try {
            return roomList.filter(str => {
                return str.roomName.substr(0, wordFilter.length) === wordFilter;
            });
        } catch (e) {
            return roomList;
        }
    }

    public resetRoom(): void {
        this.initializeRoomData();
        this.initializeRoomContentArray();
    }

    public createRoomListener(): Observable<RoomMessage> {
        return this.roomSocket.getCreateRoomUpdate();
    }

    public deleteRoomListener(): Observable<RoomMessage> {
        return this.roomSocket.getDeleteRoomUpdate();
    }

    public joinRoomListener(): Observable<RoomMessage> {
        return this.roomSocket.getJoinRoomUpdate();
    }

    public leaveRoomListener(): Observable<RoomMessage> {
        return this.roomSocket.getLeaveRoomUpdate();
    }
}
