export type ChatMessageReceived = {
    content: string;
    roomName: string;
};

export type ChatMessageToSend = {
    content: string;
    roomName: string;
    author: string;
    timestamp: string;
    _id: any
    avatar: number;
};


export type RoomQuery = {
    roomName?: string,
    users_id?: string[],
    messages_id?: string[],
    creator?: string,
}

export type RoomJoinReceived = {
    roomName: string;
}

export type RoomJoinToSend = {
    roomName: string;
    username: string;
    creator: string;
}

export type RoomCreateReceived = {
    roomName: string;
}

export type RoomCreateToSend = {
    roomName: string;
    username: string;
}

export type RoomLeaveReceived = {
    roomName: string;
}

export type RoomLeaveToSend = {
    roomName: string;
    username: string;
}


export type RoomDeleteReceived = {
    roomName: string;
}

export type RoomDeleteToSend = {
    roomName: string;
}
