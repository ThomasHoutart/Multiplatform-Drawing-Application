export type ChatMessage = {
    content: string;
    author: string;
    timestamp: string;
    roomName: string;
    avatar: number;
    _id?: string
};

export interface ChatMessageDesktop {
    chatMessage: ChatMessage;
    type: number;
}
