import { RoomController, RoomInfo } from "../../database/room/RoomController";
import { PermissionError } from "../../errors/generic";
import { RoomAlreadyExistsError, RoomDoesNotExistError, UserAlreadyInRoomError, UserNotInRoomError } from "../../errors/room";
import { UserAlreadyLoggedInError, UserDoesNotExistError } from "../../errors/user";
import {
    ChatMessageReceivedEvent,
    ChatMessageToSendEvent,
} from "../../events/chatEvents";
import {
    DeleteRoomToSendEvent,
    JoinRoomToSendEvent,
    LeaveRoomToSendEvent,
    CreateRoomToSendEvent,
} from "../../events/roomEvents";
import { List } from "../../List";
import { ChatMessageToSend } from "../../types/message";
import { Sleeper } from "../Sleeper";

export interface RoomNameAndCreator {
    roomName: string;
    creator: string;
}

export class RoomService {
    private static instance: RoomService;

    public static getInstance(roomController?: RoomController): RoomService {
        if (!RoomService.instance)
            RoomService.instance = new RoomService(roomController as RoomController);
        return RoomService.instance;
    }
    
    public rooms: List<string>;
    public roomsByUser: Map<string, List<string>>;
    public usersByRoomName: Map<string, List<string>>;
    public roomCreatorByRoomName: Map<string, string>;

    private constructor(
        public roomController: RoomController
    ) {
        this.rooms = new List();
        this.roomsByUser = new Map();
        this.usersByRoomName = new Map();
        this.roomCreatorByRoomName = new Map();
    }

    public async init(): Promise<void> {
        try {
            this.rooms = new List();
            this.roomsByUser = new Map();
            this.usersByRoomName = new Map();
            this.roomCreatorByRoomName = new Map();
            await this.general();
            const rooms = await this.roomController.getAllRooms();
            await rooms.foreach(async (room: RoomInfo) => {
                try {
                    if (room.roomName.startsWith('Lobby:')) {
                        await this.roomController.delete(room.roomName);
                    } else {
                        await this.createRoom(
                            room.roomName as string,
                            room.creator as string,
                            false
                        );
                    }
                } catch (e) { (console).log(`couldn't create room:${e}`);}
            });
        } catch (e) {
            (console).log(e);
        }
    }

    public async general() {
        await this.roomController.createGeneral();
        this.roomsByUser.set("System", new List(["General"]));
        this.roomCreatorByRoomName.set("General", "System");
        this.rooms.push("General");
        this.usersByRoomName.set("General", new List())
    }

    public async getAllRoomsOrByUser(user?: string): Promise<List<RoomNameAndCreator>> {
        if (!user) return this.getAllRooms();
        return await this.getRoomsByUsername(user).map((roomName: string) => {
            return {
                roomName: roomName,
                creator: this.getRoomCreatorByRoomName(roomName),
            } as RoomNameAndCreator;
        });
    }

    public async getAllRooms(): Promise<List<RoomNameAndCreator>> {
        return await this.rooms.map((roomName: string) => {
            return {
                roomName: roomName,
                creator: this.getRoomCreatorByRoomName(roomName),
            };
        });
    }

    public async createRoom(roomName: string, user: string, updateDB = true, force = false): Promise<void> {
        roomName.trim();
        if (roomName.startsWith('Lobby:') && !force)
            throw new PermissionError();
        if (this.roomExists(roomName))
            throw new RoomAlreadyExistsError();
        if (updateDB && !this.roomsByUser.has(user))
            throw new UserDoesNotExistError();
        this.rooms.push(roomName);
        this.usersByRoomName.set(roomName, new List());
        this.roomCreatorByRoomName.set(roomName, user);
        if (updateDB) {
            await this.roomController.create(roomName, user);
            await new CreateRoomToSendEvent(user, roomName).emit();
        }
        await this.join(user, roomName, updateDB);
    }

    public async deleteRoom(roomName: string, user: string, updateDB = true, force = false): Promise<void> {
        if (roomName.startsWith('Lobby:') && !force)
            throw new PermissionError();
        if (!this.roomExists(roomName))
            throw new RoomDoesNotExistError();
        if (this.getRoomCreatorByRoomName(roomName) != user && !force)
            throw new PermissionError();
        if (updateDB)
            await this.roomController.delete(roomName);
        this.rooms.remove(roomName);
        const users = this.getusersByRoomName(roomName);
        await users.foreach(async (user: string) => { await this.getRoomsByUsername(user).remove(roomName); });
        this.usersByRoomName.delete(roomName);
        this.roomCreatorByRoomName.delete(roomName);
        await new DeleteRoomToSendEvent(user, roomName).emit();
    }

    public roomExists(roomName: string): boolean {
        return this.rooms.has(roomName);
    }

    public async join(user: string, roomName: string, updateDB = true): Promise<void> {
        const rooms = this.getRoomsByUsername(user);
        if (!this.roomExists(roomName))
            throw new RoomDoesNotExistError();
        if (this.getusersByRoomName(roomName).has(user))
            throw new UserAlreadyInRoomError();
        if (updateDB)
            await this.roomController.addUser(roomName, user);
        rooms.push(roomName);
        this.getusersByRoomName(roomName).push(user);
        await new JoinRoomToSendEvent(user, roomName, this.getRoomCreatorByRoomName(roomName), this.getusersByRoomName(roomName)).emit();
    }

    public async leave(user: string, roomName: string, updateDB = true, logout = false): Promise<void> {
        if (updateDB)
            await this.roomController.removeUser(roomName, user);
        if (!this.rooms.has(roomName))
            throw new RoomDoesNotExistError();
        if (!this.userIsInRoom(user, roomName))
            throw new UserNotInRoomError();
        this.getRoomsByUsername(user).remove(roomName);
        const users = this.getusersByRoomName(roomName);
        const usersToNotify = new List(users);
        users.remove(user);
        await new LeaveRoomToSendEvent(user, roomName, this.getRoomCreatorByRoomName(roomName), logout ? users : usersToNotify).emit();
    }

    public getRoomsByUsername(user: string): List<string> {
        const rooms = this.roomsByUser.get(user);
        if (!rooms)
            throw new UserDoesNotExistError();
        return rooms;
    }

    public getusersByRoomName(roomName: string): List<string> {
        const users = this.usersByRoomName.get(roomName);
        if (!users)
            throw new RoomDoesNotExistError();
        return users;
    }

    public getRoomCreatorByRoomName(roomName: string): string {
        const user = this.roomCreatorByRoomName.get(roomName);
        if (!user)
            throw new RoomDoesNotExistError();
        return user;
    }

    public userIsInRoom(user: string, roomName: string): boolean {
        return this.getusersByRoomName(roomName).has(user);
    }

    public async login(user: string): Promise<void> {
        if (this.roomsByUser.has(user))
            throw new UserAlreadyLoggedInError();
        try {
            this.roomsByUser.set(user, new List<string>());
            await this.join(user, "General", false);
            await Sleeper.sleep(222); /* for mobile client buggy code */
            const rooms = await this.roomController.getRoomsByUser(user);
            await rooms.foreach(async (roomInfo: RoomInfo) => {
                if (!this.userIsInRoom(user, roomInfo.roomName))
                    await this.join(user, roomInfo.roomName, false).catch(() => { return });
            });
        } catch (e) {
            (console).log('Error in login', e);
        }
    }

    public async logout(user: string): Promise<void> {
        const rooms = new List(this.getRoomsByUsername(user));
        await rooms.foreach(async (roomName: string) => {
            await this.leave(user, roomName, false, true);
        }, false);
        this.roomsByUser.delete(user);
    }

    public async chatMessageReceived(ev: ChatMessageReceivedEvent): Promise<void> {
        if (!this.userIsInRoom(ev.author, ev.roomName) && !ev.author.startsWith('bot_'))
            throw new UserNotInRoomError();
        const users = this.getusersByRoomName(ev.roomName);
        const _ev = {
            author: ev.author,
            content: ev.message,
            roomName: ev.roomName,
            timestamp: ev.timestamp.toString(),
            _id: "",
            avatar: ev.avatar,
        };
        const id = await this.roomController.addMessage(_ev);
        _ev._id = id || "";
        await new ChatMessageToSendEvent(users, _ev).emit()
    }

    public getPreviousMessages(roomName: string, msgID?: string): Promise<List<ChatMessageToSend>> {
        return this.roomController.get20MessagesFromId(roomName, msgID);
    }
}
