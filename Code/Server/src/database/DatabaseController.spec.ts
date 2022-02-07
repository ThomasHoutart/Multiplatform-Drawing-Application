/* eslint-disable max-lines-per-function */
import { DatabaseController } from "./DatabaseController";
import { UserController } from "./user/UserController";
import { GameController } from "./game/GameController";
import { RoomController, RoomInfo } from "./room/RoomController";
import { MessageController } from "./message/MessageController";
import mongoose from "mongoose";
import { ClientUser, Connection, Trophy } from "../types/user";
import { List } from "../List";
import { ChatMessageToSend } from "../types/message";
import {
	Difficulty,
	GameInfo,
	GameType,
	UsernameScoreAvatar,
} from "../types/game";
import { UserTrophyEvent } from "../events/userEvents";

const mockUser1: ClientUser = {
	username: "mockuser1",
	firstName: "mockuser1",
	lastName: "mockuser1",
	email: "mockuser1",
	salt: "mockuser1",
	hash: "mockuser1",
	avatar: 0,
};
const mockUser2: ClientUser = {
	username: "mockuser2",
	firstName: "mockuser2",
	lastName: "mockuser2",
	email: "mockuser2",
	salt: "mockuser2",
	hash: "mockuser2",
	avatar: 1,
};
const mockRoom1: RoomInfo = {
	roomName: "mockroom1",
	users_id: [],
	messages_id: [],
	creator: "mockuser1",
};
const mockRoom2: RoomInfo = {
	roomName: "mockroom2",
	users_id: [],
	messages_id: [],
	creator: "mockuser2",
};
const mockRoom3: RoomInfo = {
	roomName: "mockroom3",
	users_id: [],
	messages_id: [],
	creator: "mockuser2",
};
const mockMessage: ChatMessageToSend = {
	content: "mockmsg",
	author: "mockuser1",
	timestamp: "Fri Oct 16 2020 16:59:02 GMT-0400 (Eastern Daylight Time)",
	roomName: "mockroom1",
	_id: "gniergjnoeirgnoer",
	avatar: 1,
};

const mockGame1: GameInfo = {
	name: "mockGame1",
	timestamp: new Date("Fri Oct 16 2020 16:59:02 GMT-0400 (Eastern Daylight Time)"),
	totalTime: 120 * 1000,
	score: new List<UsernameScoreAvatar>([
		{ username: mockUser1.username, score: 220, avatar: 1 },
		{ username: mockUser2.username, score: 110, avatar: 1 },
	]),
	gameType: GameType.BR,
	difficulty: Difficulty.Easy,
};
const mockGame2: GameInfo = {
	name: "mockGame2",
	timestamp: new Date("Tue Oct 6 2020 16:59:02 GMT-0400 (Eastern Daylight Time)"),
	totalTime: 10 * 1000,
	score: new List<UsernameScoreAvatar>([
		{ username: mockUser1.username, score: 320, avatar: 1 },
	]),
	gameType: GameType.BR,
	difficulty: Difficulty.Easy,
};
const mockGame3: GameInfo = {
	name: "mockGame3",
	timestamp: new Date("Sat Sept 16 2020 16:59:02 GMT-0400 (Eastern Daylight Time)"),
	totalTime: 60 * 1000,
	score: new List<UsernameScoreAvatar>([
		{ username: mockUser1.username, score: 640, avatar: 1  },
		{ username: mockUser2.username, score: 630, avatar: 1  },
	]),
	gameType: GameType.FFA,
	difficulty: Difficulty.Hard,
};

const MOCK_USER1_CONNECTION1: Connection = {
	login: new Date(new Date().getTime() - 60 * 1000),
	logout: new Date(),
};

const MOCK_USER1_CONNECTION2 = {
	login: new Date(new Date().getTime() - 670 * 1000),
	logout: new Date(),
};

const STATS_USER1_GAME3 = {
	gamesWon: 3,
	gamesLost: 0,
	gameTime: 190,
	loggedTime: 730,
	trophies: new List([Trophy["play1Game"], Trophy["win1Game"], Trophy["play1Minute"]]),
	connections: new List([MOCK_USER1_CONNECTION1, MOCK_USER1_CONNECTION2]),
};
const STATS_USER2_GAME3 = {
	gamesWon: 0,
	gamesLost: 2,
	gameTime: 180,
	loggedTime: 0,
	trophies: new List([Trophy["play1Game"], Trophy["play1Minute"]]),
	connections: new List([]),
};
const LEADERBOARDS = {
	FFA: {
		Easy: {Day: [], Week: [], Total: []},
		Normal: {Day: [], Week: [], Total: []},
		Hard: {Day: [], Week: [], Total: [
			{ username: mockUser2.username, nWins: 0, avatar: 1 },
			{ username: mockUser1.username, nWins: 1, avatar: 1 },]},
	},
	BR: {
		Easy:{Day: [], Week: [], Total: [
			{ username: mockUser2.username, nWins: 0, avatar: 1 },
			{ username: mockUser1.username, nWins: 2, avatar: 1 },
		]},
		Normal: {Day: [], Week: [], Total: []},
		Hard: {Day: [], Week: [], Total: []},
	},
};
const MOCK_USER1_PROFILE = {
	nWins: STATS_USER1_GAME3.gamesWon,
	nLosses: STATS_USER1_GAME3.gamesLost,
	totalTimeMinutes: STATS_USER1_GAME3.loggedTime,
	totalGameTimeMinutes: STATS_USER1_GAME3.gameTime,
	connections: UserController.connectionListToSend(STATS_USER1_GAME3.connections),
	FFA: {
		Easy: [],
		Normal: [],
		Hard: UserController.gameModeInfoToSend([mockGame3]),
	},
	BR: {
		Easy: UserController.gameModeInfoToSend([mockGame2, mockGame1]),
		Normal: [],
		Hard: [],
	},
};
const MOCK_USER2_PROFILE = {
	nWins: STATS_USER2_GAME3.gamesWon,
	nLosses: STATS_USER2_GAME3.gamesLost,
	totalTimeMinutes: STATS_USER2_GAME3.loggedTime,
	totalGameTimeMinutes: STATS_USER2_GAME3.gameTime,
	connections: UserController.connectionListToSend(STATS_USER2_GAME3.connections),
	FFA: {
		Easy: [],
		Normal: [],
		Hard: UserController.gameModeInfoToSend([mockGame3]),
	},
	BR: {
		Easy: UserController.gameModeInfoToSend([mockGame1]),
		Normal: [],
		Hard: [],
	},
};

describe("Controllers", () => {
	it("should connect to DB upon init", async () => {
		const dbCntrl = new DatabaseController(false);
		expect(mongoose.connection.readyState).toEqual(0);
		await dbCntrl.init();
		expect(mongoose.connection.readyState).toEqual(1);
		await dbCntrl.disconnect();
	});

	it("should function properly", async () => {
		const db = new DatabaseController(false);
		await db.init();
		const gameController = new GameController(db);
		const userController = new UserController(db, gameController);
		const messageController = new MessageController(db);
		const roomController = new RoomController(
			db,
			messageController,
			userController
		);
		userController.gameController = gameController;

		UserTrophyEvent.subscribe(async (event: UserTrophyEvent) => {
			await userController.addTrophy(event.username, event.trophy);
		});

		await userController.clear();
		await messageController.clear();
		await roomController.clear();
		await gameController.clear();

		await roomController.createGeneral();

		await userController.add(mockUser1);
		await userController.add(mockUser2);

		await roomController.create(mockRoom1.roomName, mockUser1.username);
		await roomController.create(mockRoom2.roomName, mockUser2.username);
		await roomController.create(mockRoom3.roomName, mockUser2.username);

		await roomController.addMessage(mockMessage);
		await new Promise((resolve) => setTimeout(resolve, 1000));
		await roomController.addMessage(mockMessage);

		await roomController.addUser(mockRoom1.roomName, mockUser1.username);
		await roomController.addUser(mockRoom1.roomName, mockUser2.username);
		await roomController.addUser(mockRoom2.roomName, mockUser2.username);
		await roomController.addUser(mockRoom3.roomName, mockUser2.username);

		await gameController.add(mockGame1);
		await gameController.add(mockGame2);
		await gameController.add(mockGame3);

		await userController.addConnection(
			mockUser1.username,
			MOCK_USER1_CONNECTION1
		);
		await userController.addConnection(
			mockUser1.username,
			MOCK_USER1_CONNECTION2
		);

		await new Promise((resolve) => setTimeout(resolve, 1000));

		const messages = await roomController.get20MessagesFromId(
			mockRoom1.roomName
		);
		const emptymsg = await roomController.get20MessagesFromId(
			mockRoom2.roomName
		);
		const room1 = await roomController.getRoomByName(mockRoom1.roomName);
		const room2 = await roomController.getRoomByName(mockRoom2.roomName);
		const room3 = await roomController.getRoomByName(mockRoom3.roomName);
		const user1 = await userController.get(mockUser1.username);
		const user2 = await userController.get(mockUser2.username);
		const msgs = new List([
			{ ...mockMessage, _id: room1.messages_id[0] },
			{ ...mockMessage, _id: room1.messages_id[1] },
		]);
		const user1Rooms = await roomController.getRoomsByUser(user1.username);
		const user2Rooms = await roomController.getRoomsByUser(user2.username);

		const user1Games = await userController.getGames(user1.username);
		const user2Games = await userController.getGames(user2.username);

		const game1 = await gameController.get(mockGame1.name);
		const game2 = await gameController.get(mockGame2.name);
		const game3 = await gameController.get(mockGame3.name);

		const user1Profile = await userController.getUserProfile(
			mockUser1.username
		);
		const user2Profile = await userController.getUserProfile(
			mockUser2.username
		);

		const user1Trophies = await userController.getUserTrophies(
			mockUser1.username
		);
		const user2Trophies = await userController.getUserTrophies(
			mockUser2.username
		);

		const leaderboards = await gameController.getLeaderboards();

		expect(user1Rooms).toEqual(new List([room1]));
		expect(user2Rooms).toEqual(new List([room1, room2, room3]));

		expect({ ...user1, games_id: [] }).toEqual({
			...mockUser1,
			...STATS_USER1_GAME3,
			_id: user1._id,
			games_id: [],
		});
		expect({ ...user2, games_id: [] }).toEqual({
			...mockUser2,
			...STATS_USER2_GAME3,
			_id: user2._id,
			games_id: [],
		});

		expect(emptymsg).toEqual(new List([]));
		expect(messages.length()).toEqual(2);
		const formatedDates = new List<ChatMessageToSend>([])
		await messages.foreach(async msg => {
			formatedDates.push({...msg, timestamp:msg.timestamp.replace("GMT-04:00", "Eastern Daylight Time")})
		});
		expect(formatedDates).toEqual(msgs);

		expect(room1).toEqual({
			creator: mockRoom1.creator,
			roomName: mockRoom1.roomName,
			users_id: [user1._id, user2._id],
			messages_id: [messages.get(0)._id, messages.get(1)._id],
		});
		expect(room2).toEqual({
			creator: mockRoom2.creator,
			roomName: mockRoom2.roomName,
			users_id: [user2._id],
			messages_id: [],
		});

		expect(user1).not.toEqual(user2);
		expect(room1).not.toEqual(room2);

		expect(user1.games_id.length).toEqual(3);
		expect(user2.games_id.length).toEqual(2);

		expect(user1Games).toEqual(new List([game3, game2, game1]));
		expect(user2Games).toEqual(new List([game3, game1]));

		expect(game1).toEqual(mockGame1);
		expect(game2).toEqual(mockGame2);
		expect(game3).toEqual(mockGame3);

		expect(user1Profile).toEqual(MOCK_USER1_PROFILE);
		expect(user2Profile).toEqual(MOCK_USER2_PROFILE);

		expect(user1Trophies).toEqual(new List(STATS_USER1_GAME3.trophies));
		expect(user2Trophies).toEqual(new List(STATS_USER2_GAME3.trophies));

		expect(leaderboards).toEqual(LEADERBOARDS);

		await userController.clear();
		await messageController.clear();
		await roomController.clear();
		await db.disconnect();
	});
});

// verify is endGame is called if folks exit mid-game
