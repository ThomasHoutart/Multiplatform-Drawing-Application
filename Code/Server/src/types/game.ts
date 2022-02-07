import { List } from "../List";
import { UsernameAvatarWins } from "./user";

export enum Difficulty {
	Easy = "Easy",
	Normal = "Normal",
	Hard = "Hard",
}

export type GameInfo = {
	name: string;
	timestamp: Date;
	totalTime: number;
	score: List<UsernameScoreAvatar>;
	gameType: GameType;
	difficulty: Difficulty;
};

export type GameQuery = {
	name?: string;
	timestamp?: Date;
	totalTime?: number;
	score?: UsernameScoreAvatar[];
	type?: string;
	difficulty?: string;
};

export type LeaderBoards = {
	FFA: {
		Easy: List<UsernameAvatarWins>;
		Normal: List<UsernameAvatarWins>;
		Hard: List<UsernameAvatarWins>;
	};
	BR: {
		Easy: List<UsernameAvatarWins>;
		Normal: List<UsernameAvatarWins>;
		Hard: List<UsernameAvatarWins>;
	};
};

export const EMPTY_LEADERBOARD: any = {
	FFA: { Easy: {Day: [], Week: [], Total: []}, Normal: {Day: [], Week: [], Total: []}, Hard: {Day: [], Week: [], Total: []} },
	BR: { Easy: {Day: [], Week: [], Total: []}, Normal: {Day: [], Week: [], Total: []}, Hard: {Day: [], Week: [], Total: []} },
};

export enum GameType {
	FFA = "FFA",
	BR = "BR",
}

export enum DateFilter {
	Day = "day",
	Week = "week",
	Total = "total",
}

export type LobbyCreateMessageReceived = {
	gameName: string;
	gameMode: string;
	difficulty: string;
};

export type LobbyJoinMessageReceived = {
	gameName: string;
};

export type LobbyCreateMessageToSend = {
	gameName: string;
	gameMode: string;
	difficulty: string;
	username: string;
};

export type LobbyJoinMessageToSend = {
    username: string;
    gameName: string;
    avatar: number;
}

export type LobbyLeaveMessageToSend = {
	username: string;
};

export type GameJoinMessageReceived = {
	gameName: string;
};

export type GameJoinMessageToSend = {
	username: string;
};

export type GameLeaveMessageToSend = {
	username: string;
};

export type DeleteLobbyOrGameMessageToSend = {
	gameName: string;
};

export type StartGameMessageToSend = {
	gameName: string;
};

export type StartRoundMessageToSend = {
	artist: string;
};

export type EndRoundMessageToSend = {
    scores: UsernameScoreAvatar[];
    word: string;
}

export type WordToDrawMessageToSend = {
	word: string;
};

export type SetPathMessage = {
	pathId: number;
	color: string;
	strokeWidth: number;
	path: string;
	canvasSize: number;
};

export type AppendToPathMessage = {
	x: number;
	y: number;
};

export type WordFoundMessage = {
    username: string;
    avatar: number;
}

export type usernameAndAvatar = {
    username: string;
    avatar: number;
}

export type UsernameScoreAvatar = {
    username: string;
    score: number;
    avatar: number;
}

export type LobbyInfoMessage = {
    players: usernameAndAvatar[];
    spectators: usernameAndAvatar[];
}

export type GameInfoMessage = {
    scores: UsernameScoreAvatar[];
}

export type UpdateLobbyMessage = {
	gameName: string;
	playerCount: number;
};

export type GameTickToSend = {
	timeLeft: number;
};

export type KickPlayerRequest = {
	username: string;
};
