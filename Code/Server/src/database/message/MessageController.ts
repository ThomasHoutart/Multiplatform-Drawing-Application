import MessageModel, { DBMessage } from "./message";
import { DatabaseController } from "../DatabaseController";
import { List } from "../../List";
import { ChatMessageToSend } from "../../types/message";

export class MessageController {
	constructor(public db: DatabaseController) {}

	add = async (msg: ChatMessageToSend): Promise<ChatMessageToSend> => {
		const message = new MessageModel({ ...msg, _id: undefined });
		const saved = await message.save();
		if (!saved) throw new Error();
		return this.db.documentToObject(message) as ChatMessageToSend;
	};

	getMessagesFromIds = async (
		ids: string[]
	): Promise<List<ChatMessageToSend>> => {
		const messages = await MessageModel.find({ _id: { $in: ids } });
		if (!messages) throw new Error();
		return this.db.documentArrayToList(messages);
	};

    get20MessagesById = async (roomName: string,id?: string): Promise<List<ChatMessageToSend>> => {
        const lastMessage = id
            ? await MessageModel.findOne({ _id: id, roomName })
            : await MessageModel.findOne({ roomName }).sort({ timestamp: -1 }).limit(1);
        if (!lastMessage)
            if (!id)
                return new List();
            else
                throw new Error();
        const messages = await MessageModel.find({
            roomName,
            timestamp: { $lte: lastMessage.timestamp },
        }).sort({ timestamp: -1 }).limit(25);
        const list: List<ChatMessageToSend> = await this.db.documentArrayToList(this.filterListmessages(messages, id));
        return this.getFixedDates(list);
    };

    private async getFixedDates(messages: List<ChatMessageToSend>): Promise<List<ChatMessageToSend>> {
        const newList: List<ChatMessageToSend> = new List();
        await messages.foreach(async (message: ChatMessageToSend) => {
            const fixed: ChatMessageToSend = {
                content: message.content,
                author: message.author,
                roomName: message.roomName,
                timestamp: new Date(message.timestamp).toString(),
                _id: message._id,
                avatar: message.avatar,
            };
            await newList.push(fixed);
        });
        return newList;
    }

	private filterListmessages(
		messages: DBMessage[],
		id?: string
	): DBMessage[] {
		messages.reverse();
		if (id) {
			let found = false;
			const temp: DBMessage[] = [];
			messages.forEach((m) => {
				found = found || m.id == id;
				if (!found) temp.push(m);
			});
			messages = temp;
		}
		messages.splice(0, messages.length - 20);
		return messages;
	}

	clear = async (): Promise<void> => {
		if (!(await MessageModel.deleteMany({}))) throw new Error();
	};
}
