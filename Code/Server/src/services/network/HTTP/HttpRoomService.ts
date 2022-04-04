import express from "express";
import { List } from "../../../List";
import { ChatMessageToSend } from "../../../types/message";
import { RoomService } from "../../Core/RoomService";

export class HttpRoomService {
    private roomService: RoomService;

    constructor(private app: express.Express) {
        this.roomService = RoomService.getInstance();
    }

    public init(): void {
        this.roomList();
        this.previousMessages();
    }

    private roomList() {
        this.app.get('/room/list/', async (request, response) => {
            await this.roomListRequest(request, response);
        });
    }

    public async roomListRequest(request: any, response: any) {
        try {
            const user = request.query.user as string;
            const rooms = await this.roomService.getAllRoomsOrByUser(user);
            response.status(200).json({
                rooms: rooms.getArray()
            });
        } catch (e) {
            this.respondWithError(e, response);
        }
    }

    private respondWithError(e: Error, response: any) {
        response.sendStatus(400);
    }

    private previousMessages() {
        this.app.get('/room/messagehistory/', async (request, response) => {
            await this.roomMessageHistoryRequest(request, response);
        });
    }

    public async roomMessageHistoryRequest(request: any, response: any) {
        try {
            const room = request.query.roomName as string;
            const id = request.query.firstKnownId?.toString();
            const history = await this.getHistory(room, id);
            response.status(200).json({
                messageHistory: history.getArray(),
            });
        } catch(e) {
            (console).log(e);
            response.sendStatus(400);
        }
    }

    public async getHistory(room: string, firstKnownId?: string): Promise<List<ChatMessageToSend>> {
        const history = await this.roomService.getPreviousMessages(room, firstKnownId);
        await history.foreach(async (msg: ChatMessageToSend) => {
            msg.timestamp = await new Date(msg.timestamp).toString();
        });
        return history;
    }
}
