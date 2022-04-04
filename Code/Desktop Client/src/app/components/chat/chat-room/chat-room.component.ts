import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Room, RoomInfo, RoomMessage } from 'src/app/models/interface/room-info';
import { RoomService } from 'src/app/services/room/room.service';

@Component({
    selector: 'app-chat-room',
    templateUrl: './chat-room.component.html',
    styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit, OnDestroy {

    form: FormGroup;
    public roomList: RoomMessage[];
    public filteredRoomList: RoomMessage[];
    public fetchedList: boolean;
    public roomListener: Subscription;
    public errorMessages: string[];

    public emptyList = false;

    constructor(public dialogRef: MatDialogRef<ChatRoomComponent>,
        private formBuilder: FormBuilder,
        private room: RoomService,) {
        this.roomList = this.room.roomList;
        this.filteredRoomList = this.roomList;
        this.fetchedList = false;
        this.errorMessages = [];
    }

    onChange(): void {
        this.filteredRoomList = this.room.updateRoomSearchList(this.roomList, this.form.get('room').value);
        this.emptyList = false;
        if (this.filteredRoomList.length == 0) { this.emptyList = true; }
    }

    onJoin(room: RoomInfo): void {
        this.room.clearCounter(room.roomName);
        this.room.joinRoom(room);
        this.room.joiningRoom.next();
        this.dialogRef.close();
    }

    onCreate(): void {
        this.room.createRoom(this.form.get('room').value);
        this.dialogRef.close();
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    initialFilter(roomList: Room): void {
        roomList.rooms = roomList.rooms.filter(element => {
            return element.roomName.substr(0, 6) !== 'Lobby:'
        })
    }

    initializeRoomListerner(): void {
        this.roomListener = this.room.initializeRoomList().subscribe((roomList: Room) => {
            this.initialFilter(roomList);
            if (roomList) {
                this.roomList = roomList.rooms;
                this.filteredRoomList = this.roomList;
                this.fetchedList = true;
            }
        });
    }

    canCreateRoom(): boolean {
        this.errorMessages = [];
        if (this.room.roomList.length > 14)
            this.errorMessages = ["You cannot have more then 15 rooms,", "please remove a room before before", "creating a new one"];
        else if (this.form.get('room').invalid)
            this.errorMessages = ["Room name must have over 4 characters,", "under 30 characters and made of ","alphanumerical characters."];
        else if (this.roomList.indexOf(this.form.get('room').value) !== -1)
            this.errorMessages = ["This room name is currently hold by", "an existing room", ""];
        else if (this.form.get('room').value.substr(0, 6) === 'Lobby:')
            this.errorMessages = ["Starting the lobby name with Lobby:", "is prohibited.", ""];
        else if (this.isRoomInList())
            this.errorMessages = ["You have already join this rooms.", "", ""];
        return this.errorMessages.length==0;
    }

    isRoomInList(): boolean {
        for (const elem of this.filteredRoomList) {
            if (this.form.get('room').value === elem.roomName) {
                return true;
            }
        }

        return false
    }

    listen(): void {
        this.initializeRoomListerner();
    }

    terminate(): void {
        this.roomListener.unsubscribe();
    }

    ngOnInit(): void {
        // needs a regex for name
        this.form = this.formBuilder.group({
            room: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(30)]],
        });
        this.listen();
    }

    ngOnDestroy(): void {
        this.terminate();
    }
}
