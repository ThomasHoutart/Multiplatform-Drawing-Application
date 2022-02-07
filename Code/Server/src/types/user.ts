import { List } from "../List";
import { GameInfo } from "./game";

export type LoginCredential = {
	username: string;
	hash: string;
};

export type ClientUser = LoginCredential & {
	firstName: string;
	lastName: string;
	email: string;
	salt: string;
	avatar: number;
};

export type UserInfo = ClientUser & {
	_id: string;
	gamesWon: number;
	gamesLost: number;
	gameTime: number;
	loggedTime: number;
	games_id: string[];
	trophies: List<Trophy>;
	connections: List<Connection>;
};

export type UserQuery = {
	username: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	hash?: string;
	gamesWon?: number;
	gamesLost?: number;
	gameTime?: number;
	loggedTime?: number
	games_id?: string[];
	trophies?: string[];
	connections?: Connection[]
};

export type AuthenticationInfo = {
	firstName: string;
	lastName: string;
	theme: string;
	hashSocketId: string;
	avatar: number;
	firstTime: boolean;
};

export type ProfileInfo = {
	nWins: number;
	nLosses: number;
	loggedTime: number;
	gameTime: number;
	connections: Connection[];
	FFA: GameModeInfo;
	BR: GameModeInfo;
};

export type Connection = {
	login: Date;
	logout: Date;
};

export type GameModeInfo = {
	Easy: GameInfo[];
	Normal: GameInfo[];
	Hard: GameInfo[];
};

export enum Trophy {
	play1Game = 'play1Game',
	play10Game = 'play10Game',
	play100Game = 'play100Game',
	win1Game = 'win1Game',
	win10Game = 'win10Game',
	win100Game = 'win100Game',
	play1Minute = 'play1Minute',
	play10Minute = 'play10Minute',
	play100Minute = 'play100Minute',
}

export type UsernameAvatarWins = {
	username: string,
	avatar: number,
	nWins: number,
}