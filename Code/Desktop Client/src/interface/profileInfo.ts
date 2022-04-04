export interface GeneralStats {
    nWins: number,
    nLosses: number,
    totalGameTimeMinutes: number,
    totalTimeMinutes: number,
}

export interface GameStats {
    name: string,
    timestamp: string,
    date: string,
    totalTime: number,
    gameMode: string,
    gameDifficulty: string,
    gameScores: GameScores[]
    startTime: string,
    endTime: string,

}
export interface GameScores {
    username: string,
    score: number,
    avatar: number,
    rank?: number
}

export interface ConnectionsHistory {
    login: string;
    logout: string;
}
