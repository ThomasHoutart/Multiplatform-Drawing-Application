/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoomService } from 'src/app/services/room/room.service';
import { ChatJoinedRoomComponent } from './chat-joined-room.component';
import { AppModule } from 'src/app/app.module';
import { SocketIoModule } from 'ngx-socket-io';
import { NgModule } from '@angular/core';
import { UserService } from 'src/app/services/user/user.service';
import { MOCK_COUNTER_LIST, MOCK_ROOM, MOCK_ROOM_INFO } from './constant';
import { of } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { DIALOG_MOCK } from 'src/app/models/mock/dialog';

// import { of } from 'rxjs/observable/of';

@NgModule({
    imports: [
        AppModule,
    ],
})
class DialogTestModule { }

describe('ChatJoinedRoomComponent', () => {

    let fixture: ComponentFixture<ChatJoinedRoomComponent>;
    let component: ChatJoinedRoomComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ DialogTestModule ],
            providers: [ SocketIoModule, UserService, RoomService,
                {provide: MatDialogRef, useValue: DIALOG_MOCK},]
        })
            .compileComponents();

        const userService = TestBed.inject(UserService);
        const getUsernameSpy: jasmine.Spy = spyOn(userService, 'getUsername');
        getUsernameSpy.and.returnValue('test');

    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatJoinedRoomComponent);
        component = fixture.componentInstance;
        // component = new ChatJoinedRoomComponent(mockRoomService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('joinRoom should call room functions clearCounter and joinRoom using the right credential', () => {
        const roomService: RoomService = TestBed.inject(RoomService);
        const clearCounterSpy: jasmine.Spy = spyOn(roomService, 'clearCounter');
        const joinRoomSpy: jasmine.Spy = spyOn(roomService, 'joinRoom');
        component.joinRoom(MOCK_ROOM_INFO);
        expect(clearCounterSpy).toHaveBeenCalledWith(MOCK_ROOM_INFO.roomName);
        expect(joinRoomSpy).toHaveBeenCalledWith(MOCK_ROOM_INFO);
    });

    it('counterListener should update the counterList with a new one', () => {
        const roomService: RoomService = TestBed.inject(RoomService);
        const updateCounterSpy: jasmine.Spy = spyOn(roomService, 'getUpdateCounter').and.returnValue(of(MOCK_COUNTER_LIST));
        component.counterListener();
        expect(updateCounterSpy).toHaveBeenCalled();
        expect(component.counterList).toEqual(MOCK_COUNTER_LIST);
    });

    it('roomListListener should update the counterList with a new one', () => {
        const roomService: RoomService = TestBed.inject(RoomService);
        const initializeRoomSpy: jasmine.Spy = spyOn(roomService, 'initializeRoomList').and.returnValue(of(MOCK_ROOM));
        component.roomListListener();
        expect(initializeRoomSpy).toHaveBeenCalled();
        expect(roomService.roomList).toEqual(MOCK_ROOM.rooms);
        expect(component.roomList).toEqual(MOCK_ROOM.rooms);
    });

});
