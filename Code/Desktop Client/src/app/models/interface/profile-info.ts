export interface ProfileInfo {
    BR: any[][][],
    FFA: any[][][],
    connections: Connections[],
    nLosses: number,
    nWins: number,
    totalGameTimeMinutes: number,
    totalTimeMinutes: number,
}


export interface Connections {
    login: string,
    logout: string,
}

export interface GameStats {
    gamePlayed: number,
    winrate: number,
    totalGameTime: number,
    totalTime: number,
}