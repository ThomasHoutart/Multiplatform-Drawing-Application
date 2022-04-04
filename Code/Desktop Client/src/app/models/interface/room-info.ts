export interface RoomInfo {
    creator: string;
    roomName: string;
}

export interface Room {
    rooms: RoomInfo[];
}

export type RoomMessage = {
    roomName: string;
    username?: string;
    creator?: string;
};
