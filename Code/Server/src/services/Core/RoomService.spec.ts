/* eslint-disable max-lines-per-function */
import { RoomController, RoomInfo } from "../../database/room/RoomController";
import { PermissionError } from "../../errors/generic";
import { RoomAlreadyExistsError, RoomDoesNotExistError } from "../../errors/room";
import { UserAlreadyLoggedInError, UserDoesNotExistError } from "../../errors/user";
import { ChatMessageReceivedEvent } from "../../events/chatEvents";
import { List } from "../../List";
import { ChatMessageToSend } from "../../types/message";
import { RoomService } from "./RoomService";

let _this: RoomService;

class MockRoomController {
    public join(user: string, room: string) {
        if (!room || !user)
            throw new Error();
    }

    public getAllRooms() {
        return new List();
    }

    public addUser(room: string, user: string) {
        if (!room || !user)
            throw new Error();
    }

    public getRoomsByUser(user: string) {
        if (!user)
            throw new Error();
        return new List<string>();
    }

    public delete(room: string) {
        if (!room)
            throw new Error();
    }

    public create(roomName: string, creator: string) {
        if (!roomName || !creator)
            throw new Error();
    }

    public addMessage(ev: ChatMessageToSend) {
        if (!ev.author || !ev.content || !ev.roomName || !ev.timestamp)
            throw new Error();
    }

    public removeUser(user: string) {
        if (!user)
            throw new Error();
    }

    public createGeneral() {
        return;
    }
}

beforeEach(async () => {
    const rc = new MockRoomController() as unknown as RoomController;
    _this = RoomService.getInstance(rc);
    await _this.init();
});

describe('RoomService', () => {
    it("should be initialized properly", async () => {
        await expect((await _this.getAllRoomsOrByUser()).length()).toEqual(1);
        await expect((await _this.getAllRoomsOrByUser()).has({roomName:'General', creator: 'System'})).toBeTruthy();
        await expect(_this.getRoomCreatorByRoomName('General')).toEqual('System');
    });

    it('should not let non logged in people create or join', async () => {
        await expect(async () => await _this.join('user', 'RoomThatDoesNotExist', true)).rejects.toEqual(new UserDoesNotExistError());
        await expect(async () => await _this.createRoom('room1', 'user1', true)).rejects.toEqual(new UserDoesNotExistError());
    });

    it('should let users join rooms', async () => {
        await _this.login('user1').catch(() => expect(false).toBeTruthy());
        await _this.createRoom('room1', 'user1', true).catch(() => expect(false).toBeTruthy());
        await _this.login('user2').catch(() => expect(false).toBeTruthy());
        await _this.login('user3').catch(() => expect(false).toBeTruthy());
        await _this.join('user2', 'room1', true).catch(() => expect(false).toBeTruthy());
        await _this.join('user3', 'room1', true).catch(() => expect(false).toBeTruthy());
    });

    it('should add users to rooms', async () => {
        await _this.login('user1').catch(() => expect(false).toBeTruthy());
        await _this.createRoom('room1', 'user1', true).catch(() => expect(false).toBeTruthy());
        await _this.login('user2').catch(() => expect(false).toBeTruthy());
        await _this.login('user3').catch(() => expect(false).toBeTruthy());
        await _this.join('user2', 'room1', true).catch(() => expect(false).toBeTruthy());
        await _this.join('user3', 'room1', true).catch(() => expect(false).toBeTruthy());
    });

    it('should not add users to rooms', async () => {
        await _this.login('user1').catch(() => expect(false).toBeTruthy());
        await _this.createRoom('room1', 'user1', true).catch(() => expect(false).toBeTruthy());
        await expect(async () => await _this.join('user2', 'room1', true)).rejects.toEqual(new UserDoesNotExistError());
        await expect(async () => await _this.join('user1', 'room2', true)).rejects.toEqual(new RoomDoesNotExistError());
        await expect(async () => await _this.createRoom('room1', 'user1', true)).rejects.toEqual(new RoomAlreadyExistsError());
    });

    it('should throw if a user logs in twice', async () => {
        await _this.login('user1').catch(() => expect(false).toBeTruthy());
        await expect(async () => await _this.login('user1')).rejects.toEqual(new UserAlreadyLoggedInError());
    });

    it('should throw if a user logs out twice or logs out before logging in', async () => {
        await expect(async () => await _this.logout('user1')).rejects.toEqual(new UserDoesNotExistError());
        await _this.login('user1').catch(() => expect(false).toBeTruthy());
        await _this.logout('user1').catch(() => expect(false).toBeTruthy());
        await expect(async () => await _this.logout('user1')).rejects.toEqual(new UserDoesNotExistError());
    });

    it('should let creators delete rooms', async () => {
        await _this.login('user1').catch(() => expect(false).toBeTruthy());
        await _this.createRoom('room1', 'user1', true).catch(() => expect(false).toBeTruthy());
        await _this.deleteRoom('room1', 'user1').catch(() => expect(false).toBeTruthy());
    });

    it('should not let delete be done twice', async () => {
        await _this.login('user1').catch(() => expect(false).toBeTruthy());
        await _this.createRoom('room1', 'user1', true).catch(() => expect(false).toBeTruthy());
        await _this.deleteRoom('room1', 'user1').catch(() => expect(false).toBeTruthy());
        await expect(async () => await _this.deleteRoom('room1', 'user1')).rejects.toEqual(new RoomDoesNotExistError());
    });

    it('should not let other users delete rooms', async () => {
        await _this.login('user1').catch(() => expect(false).toBeTruthy());
        await _this.login('user2').catch(() => expect(false).toBeTruthy());
        await _this.createRoom('room1', 'user1', true).catch(() => expect(false).toBeTruthy());
        await expect(async () => await _this.deleteRoom('room1', 'user2')).rejects.toEqual(new PermissionError());
    });

    it('should receive messages fine from people in the room', async () => {
        await _this.login('user1').catch(() => expect(false).toBeTruthy());
        await _this.login('user2').catch(() => expect(false).toBeTruthy());
        await _this.createRoom('room1', 'user1', true).catch(() => expect(false).toBeTruthy());
        await _this.chatMessageReceived(new ChatMessageReceivedEvent('user1', 'room1', 'hello', new Date(), 1)).catch(() => expect(false).toBeTruthy());
        await _this.join('user2', 'room1', true).catch(() => expect(false).toBeTruthy());
        await _this.chatMessageReceived(new ChatMessageReceivedEvent('user2', 'room1', 'hello', new Date(), 1)).catch(() => expect(false).toBeTruthy());
    });

    it('should join general on login', async () => {
        await _this.login('user1').catch(() => expect(false).toBeTruthy());
        await _this.chatMessageReceived(new ChatMessageReceivedEvent('user1', 'General', 'hello', new Date(), 1)).catch(() => expect(false).toBeTruthy());
    });

    it('should join rooms on login if the controller gives rooms associated to user', async () => {
        const rooms = new List<RoomInfo>([
            {
                roomName: 'room123',
                users_id: [],
                messages_id: [],
                creator: 'Someone else'
            },
            {
                roomName: 'room321',
                users_id: ['asdasd', 'asdasdasd', 'asdsdfdfgdfgdfg', '?????????'],
                messages_id: ['uurururuurr'],
                creator: 'Someone else again'
            },
        ]);
        _this = RoomService.getInstance(_this.roomController);
        _this.roomController.getRoomsByUser = async () => await rooms;
        _this.roomController.getAllRooms = async () => await rooms;
        await _this.init();
        await _this.login('user1').catch(() => expect(false).toBeTruthy());
        await _this.login('user2').catch(() => expect(false).toBeTruthy());
        await _this.chatMessageReceived(new ChatMessageReceivedEvent('user1', 'room123', 'hello', new Date(), 1)).catch(() => expect(false).toBeTruthy());
        await _this.leave('user2', 'room321', true, false).catch(() => expect(false).toBeTruthy());
        await _this.logout('user1').catch(() => expect(false).toBeTruthy());
    });
});
