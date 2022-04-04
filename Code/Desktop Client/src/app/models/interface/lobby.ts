export interface Lobby {
    gameName: string,
    gameMode?: string,
    difficulty?: string,
    username?: string,
    playerCount?: number,
    isSpectator?: boolean,
    status?: string,
    avatar?: number,
}

export interface LobbyGameList {
    games: any[],
    lobbies: Lobby[]
}

export interface LobbyUserList {
    players: UserInLobby[],
    spectators: UserInLobby[],
}

export interface UserInLobby {
    username: string;
    role: string;
    host: boolean;
    avatar: number;
}
