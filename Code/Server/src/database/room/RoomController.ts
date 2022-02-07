import { RoomAlreadyExistsError, RoomDoesNotExistError, UserAlreadyInRoomError, UserNotInRoomError } from '../../errors/room';
import { UserDoesNotExistError } from '../../errors/user';
import { List } from '../../List';
import { ChatMessageToSend } from '../../types/message';
import { ClientUser } from '../../types/user';
import { DatabaseController } from '../DatabaseController';
import MessageModel from '../message/message';
import { MessageController } from '../message/MessageController';
import { UserController } from '../user/UserController';
import RoomModel, { DBRoom } from './room';

export type RoomInfo = {
    roomName: string,
    users_id: string[],
    messages_id: string[],
    creator: string,
}

export class RoomController {
    constructor(
        public db: DatabaseController,
        public messageController: MessageController,
        public userController: UserController,
    ) { }

    create = async (roomName: string, creator: string): Promise<void> => {
        if (await this.roomExists(roomName))
            throw new RoomAlreadyExistsError();
        const room = new RoomModel({ roomName, creator });
        if (!(await room.save()))
            throw new Error();
    };

    addUser = async (roomName: string, username: string): Promise<void> => {
        const user = await this.userController.get(username);
        const isIn = await this.isUserInRoom(username, roomName);
        if (isIn)
            throw new UserAlreadyInRoomError();
        const found = await RoomModel.findOneAndUpdate(
            { roomName },
            { $push: { users_id: user._id } }
        );
        if (!found)
            throw new RoomDoesNotExistError();
    };

    removeUser = async (roomName: string, username: string): Promise<void> => {
        const user = await this.userController.get(username);
        if (!user)
            throw new UserDoesNotExistError();
        if (!await this.isUserInRoom(username, roomName))
            throw new UserNotInRoomError();
        const answer = await RoomModel.findOneAndUpdate(
            { roomName: roomName },
            { $pull: { users_id: user._id } }
        );
        if (!answer) throw new RoomDoesNotExistError();
    };

    addMessage = async (message: ChatMessageToSend): Promise<string> => {
        const chatMessage = await this.messageController.add(message);
        const added = await RoomModel.findOneAndUpdate(
            { roomName: message.roomName },
            { $push: { messages_id: chatMessage._id } }
        );
        if (!added)
            throw new Error();
        return chatMessage._id;
    };

    getRoomByName = async (roomName: string): Promise<RoomInfo> => {
        const document = await RoomModel.findOne(
            { roomName: roomName },
            '-_id'
        );
        if (!document) throw new RoomDoesNotExistError();
        return this.db.documentToObject(document);
    };

    getAllRooms = async (): Promise<List<RoomInfo>> => {
        const documentArray = await RoomModel.find({}, '-_id');
        if (!documentArray) throw new RoomDoesNotExistError();
        const roomList = new List<RoomInfo>();
        documentArray.forEach((item) => {
            if (!item.roomName) throw new Error();
            roomList.push(this.db.documentToObject(item));
        });
        return roomList;
    };

    roomExists = async (roomName: string): Promise<boolean> => {
        try {
            await this.getRoomByName(roomName);
            return true;
        } catch (e) {
            return false;
        }
    };

    get20MessagesFromId = async (roomName: string,id?: string): Promise<List<ChatMessageToSend>> => {
        return await this.messageController.get20MessagesById(roomName, id);
    };

    clear = async (): Promise<void> => {
        if (!(await RoomModel.deleteMany({}))) 
            throw new Error();
    };

    isUserInRoom = async (username: string,roomName: string): Promise<boolean> => {
        const document = await this.getRoomByName(roomName);
        const user = await this.userController.get(username);
        return !!document.users_id.find((e) => e.toString() == user._id.toString());
    };

    getRoomsByUser = async (username: string): Promise<List<RoomInfo>> => {
        const user = await this.userController.get(username);
        const rooms = await RoomModel.find({ users_id: user._id }, '-_id');
        return new List<DBRoom>(rooms).map<RoomInfo>((doc: DBRoom) =>
            this.db.documentToObject(doc)
        );
    };

    delete = async (roomName: string): Promise<void> => {
        const removed = await RoomModel.deleteOne({ roomName });
        if (!removed)
            throw new Error();
        const msgRemoved = await MessageModel.deleteMany({ roomName });
        if (!msgRemoved)
            throw new Error();
    };

    createGeneral = async (): Promise<void> => {
        await this.userController.add({ username: 'System' } as ClientUser).catch(() => { return });
        await this.create('General', 'System').catch(() => { return });
    };
}
