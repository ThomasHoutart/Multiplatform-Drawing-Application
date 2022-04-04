import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Room, RoomInfo, RoomMessage } from 'src/app/models/interface/room-info';
import { RoomService } from 'src/app/services/room/room.service';
import { LeaveRoomComponent } from 'src/app/components/warning/leave-room/leave-room.component';

@Component({
    selector: 'app-chat-joined-room',
    templateUrl: './chat-joined-room.component.html',
    styleUrls: ['./chat-joined-room.component.css'],
})
export class ChatJoinedRoomComponent implements OnInit, OnDestroy {
    public roomList: RoomMessage[];
    public counterList: number[];
    public counterSubscription: Subscription;
    public roomSubscription: Subscription;
    public roomJoinedUpdate: Subscription;

    constructor(private room: RoomService, public dialog: MatDialog) {
        this.roomList = this.room.roomList;
        this.counterList = this.room.roomNewMessageCounter;
    }

    joinRoom(room: RoomInfo): void {
        this.room.clearCounter(room.roomName);
        this.room.currentRoom = room.roomName;
        this.room.joiningRoom.next();
        this.room.ChatRoomNavigationSet(false);
    }

    leaveRoom(room: string): void {
        const dialogRef = this.dialog.open(LeaveRoomComponent);
        dialogRef.afterClosed().subscribe((isConfirmed) => {
            if (isConfirmed) this.room.leaveRoom(room);
        });
    }

    counterListener(): void {
        this.counterSubscription = this.room
            .getUpdateCounter()
            .subscribe((list: number[]) => {
                this.counterList = list;
            });
    }

    roomListListener(): void {
        this.roomSubscription = this.room
            .initializeRoomList(true)
            .subscribe((roomList: Room) => {
                if (roomList) {
                    this.room.roomList = this.room.filterRoom(roomList);
                    this.roomList = roomList.rooms;
                }
            });
    }

    roomUpdate(): void {
        this.roomJoinedUpdate = this.room.updateJoinedRooms().subscribe(() => {
            this.roomList = this.room.roomList;
        })
    }

    listen(): void {
        this.counterListener();
        this.roomListListener();
        this.roomUpdate();
    }

    terminate(): void {
        this.counterSubscription.unsubscribe();
        this.roomSubscription.unsubscribe();
        this.roomJoinedUpdate.unsubscribe();
    }

    ngOnInit(): void {
        this.listen();
    }

    ngOnDestroy(): void {
        this.terminate();
    }
}
