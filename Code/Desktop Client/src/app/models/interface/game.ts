export interface GameInfo {
    username?: string,
    artist?: string,
    difficulty?: string,
    scores?: Player[],
    gameName?: string,
    hint?: string,
    timeLeft?: number,
    word?: string,
    roundNb?: number,
    gameMode?: string,
}

export interface Player {
    username: string,
    score: number,
    avatar: number,
}

export interface UserInGame {
    username: string;
    score: number;
    scoreVarFromLastRound?: number;
    avatar: number;
    placementPosition: number;
}
