/* eslint-disable max-lines-per-function */
import express from "express";
import path from "path";
import http from "http";
import cors from "cors";
import socketIO from "socket.io";

import { UserService } from "./services/Core/UserService";
import {
	SocketInterface,
	SocketServerInterface,
	SocketService,
} from "./services/network/Socket/SocketService";
import { HttpService } from "./services/network/HTTP/HttpService";
import { SaltService } from "./services/SaltService";
import { UserController } from "./database/user/UserController";
import { HashService } from "./services/HashService";
import { SocketAuthenticatorService } from "./services/network/Socket/SocketAuthenticatorService";
import { RoomController } from "./database/room/RoomController";
import { MessageController } from "./database/message/MessageController";
import { RoomService } from "./services/Core/RoomService";
import { SubscriptionService } from "./services/subscriptionService";
import { GameService } from "./services/Core/GameService";
import { DatabaseController } from "./database/DatabaseController";
import { WordImagePairController } from "./database/wordImagePair/WordImagePairController";
import {
	ChatMessageReceivedEvent,
	ChatMessageToSendEvent,
	GameChatMessageReceivedEvent,
} from "./events/chatEvents";
import { List } from "./List";
import {
	AuthenticationEvent,
	LoginEvent,
	LogoutEvent,
} from "./events/connectionEvents";
import {
	CreateLobbyReceivedEvent,
	CreateLobbyToSendEvent,
	StartGameReceivedEvent,
	StartGameToSendEvent,
	JoinLobbyPlayerReceivedEvent,
	JoinLobbySpectatorReceivedEvent,
	JoinLobbySpectatorToSendEvent,
	JoinLobbyPlayerToSendEvent,
	UpdateLobbyToSendEvent,
	LobbyInfoToSendEvent,
	LeaveLobbyPlayerReceivedEvent,
	LeaveLobbySpectatorReceivedEvent,
	LeaveGameSpectatorReceivedEvent,
	LeaveLobbyPlayerToSendEvent,
	LeaveGamePlayerToSendEvent,
	LeaveLobbySpectatorToSendEvent,
	LeaveGameSpectatorToSendEvent,
	EndGameToSendEvent,
	DeleteLobbyReceivedEvent,
	DeleteLobbyToSendEvent,
	StartRoundToSendEvent,
	EndRoundToSendEvent,
	WordToDrawToSendEvent,
	SetPathReceivedEvent,
	SetPathToSendEvent,
	AppendToPathReceivedEvent,
	AppendToPathToSendEvent,
	WordFoundToSendEvent,
	LeaveGamePlayerReceivedEvent,
	JoinGameSpectatorReceivedEvent,
	JoinGameSpectatorToSendEvent,
	GameTickToSendEvent,
} from "./events/gameEvents";
import {
	JoinRoomReceivedEvent,
	JoinRoomToSendEvent,
	LeaveRoomReceivedEvent,
	LeaveRoomToSendEvent,
	CreateRoomReceivedEvent,
	CreateRoomToSendEvent,
	DeleteRoomReceivedEvent,
	DeleteRoomToSendEvent,
} from "./events/roomEvents";
import { UserCreatedEvent, UserTrophyEvent } from "./events/userEvents";
import {
	AddBotReceivedEvent,
	HintGameChatMessageReceivedEvent,
} from "./events/virtualPlayerEvents";
import { GameController } from "./database/game/GameController";
import { Statistics } from "./statistics/Statistics";
import { KickGameChatMessageReceivedEvent, VoteGameChatMessageReceivedEvent } from "./events/anticheatEvent";

export class App<
	Socket extends SocketInterface,
	SocketServer extends SocketServerInterface<Socket>
> {
	app: express.Express;
	server: http.Server;
	port: number;

	socketService: SocketService<Socket, SocketServer>;
	userService: UserService<Socket>;
	roomService: RoomService;
	httpService: HttpService<Socket>;
	saltService: SaltService;
	hashService: HashService;
	socketIOAuthenticatorService: SocketAuthenticatorService<Socket>;
	subscriptionService: SubscriptionService<Socket, SocketServer>;
	gameService: GameService;

	statistics: Statistics;

	userController: UserController;
	messageController: MessageController;
	roomController: RoomController;
	wordImagePairController: WordImagePairController;
	gameController: GameController;

	constructor(port: number, public db: DatabaseController) {
		this.port = port;
		this.app = express();
		this.app.use(cors());
		this.app.use(express.static(path.join(__dirname, "../out/client")));
		this.app.use(express.json());
		this.app.use(function (req, res, next) {
			res.header("Access-Control-Allow-Origin", "*");
			res.header(
				"Access-Control-Allow-Headers",
				"Origin, X-Requested-With, Content-Type, Accept"
			);
			next();
		});
		this.server = new http.Server(this.app);


		this.gameController = new GameController(this.db);
		this.messageController = new MessageController(this.db);
		UserController.setInstance(this.db, this.gameController)
		this.userController = UserController.getInstance(this.db, this.gameController)
		WordImagePairController.setInstance(this.db)
		this.wordImagePairController = WordImagePairController.getInstance(this.db);
		this.roomController = new RoomController(
			this.db,
			this.messageController,
			this.userController
		);

		this.saltService = new SaltService();
		this.hashService = new HashService();

		this.userService = new UserService();
		this.socketService = new SocketService<Socket, SocketServer>(
			this.userService,
			(socketIO(this.server) as unknown) as SocketServer
		);

		this.roomService = RoomService.getInstance(this.roomController);

		this.gameService = new GameService((username) =>
			this.userService.getAvatarByUsername(username)
		);

		this.statistics = new Statistics(
			this.gameController,
			this.userController
		);

		this.httpService = new HttpService(
			this.app,
			this.saltService,
			this.userController,
			this.roomController,
			this.gameController,
			this.wordImagePairController,
			this.hashService,
			this.gameService,
			this.userService
		);

		this.socketIOAuthenticatorService = new SocketAuthenticatorService<Socket>(
			this.hashService,
			this.userController,
			this.saltService,
			this.userService
		);
		this.subscriptionService = new SubscriptionService<
			Socket,
			SocketServer
		>(
			this.socketService,
			this.gameService,
			this.userService,
			this.socketIOAuthenticatorService,
			this.statistics
		);
	}

	public async init(): Promise<void> {
		this.resetEmitters();
		await this.roomService.init();
		await this.userService.init();
		await this.socketService.init();
		await this.saltService.init();
		await this.hashService.init();
		await this.httpService.init();
		await this.socketIOAuthenticatorService.init();
		await this.subscriptionService.init();
		await this.wordImagePairController.init();
	}

	public resetEmitters() {
		ChatMessageReceivedEvent.emitter.subscribers = new List();
		GameChatMessageReceivedEvent.emitter.subscribers = new List();
		ChatMessageToSendEvent.emitter.subscribers = new List();
		LoginEvent.emitter.subscribers = new List();
		LogoutEvent.emitter.subscribers = new List();
		AuthenticationEvent.emitter.subscribers = new List();
		CreateLobbyReceivedEvent.emitter.subscribers = new List();
		CreateLobbyToSendEvent.emitter.subscribers = new List();
		StartGameReceivedEvent.emitter.subscribers = new List();
		StartGameToSendEvent.emitter.subscribers = new List();
		JoinLobbyPlayerReceivedEvent.emitter.subscribers = new List();
		JoinLobbySpectatorReceivedEvent.emitter.subscribers = new List();
		JoinLobbySpectatorToSendEvent.emitter.subscribers = new List();
		JoinLobbyPlayerToSendEvent.emitter.subscribers = new List();
		UpdateLobbyToSendEvent.emitter.subscribers = new List();
		LobbyInfoToSendEvent.emitter.subscribers = new List();
		LeaveLobbyPlayerReceivedEvent.emitter.subscribers = new List();
		LeaveLobbySpectatorReceivedEvent.emitter.subscribers = new List();
		LeaveGameSpectatorReceivedEvent.emitter.subscribers = new List();
		LeaveLobbyPlayerToSendEvent.emitter.subscribers = new List();
		LeaveGamePlayerToSendEvent.emitter.subscribers = new List();
		LeaveLobbySpectatorToSendEvent.emitter.subscribers = new List();
		LeaveGameSpectatorToSendEvent.emitter.subscribers = new List();
		EndGameToSendEvent.emitter.subscribers = new List();
		DeleteLobbyReceivedEvent.emitter.subscribers = new List();
		DeleteLobbyToSendEvent.emitter.subscribers = new List();
		StartRoundToSendEvent.emitter.subscribers = new List();
		EndRoundToSendEvent.emitter.subscribers = new List();
		WordToDrawToSendEvent.emitter.subscribers = new List();
		SetPathReceivedEvent.emitter.subscribers = new List();
		SetPathToSendEvent.emitter.subscribers = new List();
		AppendToPathReceivedEvent.emitter.subscribers = new List();
		AppendToPathToSendEvent.emitter.subscribers = new List();
		WordFoundToSendEvent.emitter.subscribers = new List();
		LeaveGamePlayerReceivedEvent.emitter.subscribers = new List();
		JoinGameSpectatorReceivedEvent.emitter.subscribers = new List();
		JoinGameSpectatorToSendEvent.emitter.subscribers = new List();
		GameTickToSendEvent.emitter.subscribers = new List();
		JoinRoomReceivedEvent.emitter.subscribers = new List();
		JoinRoomToSendEvent.emitter.subscribers = new List();
		LeaveRoomReceivedEvent.emitter.subscribers = new List();
		LeaveRoomToSendEvent.emitter.subscribers = new List();
		CreateRoomReceivedEvent.emitter.subscribers = new List();
		CreateRoomToSendEvent.emitter.subscribers = new List();
		DeleteRoomReceivedEvent.emitter.subscribers = new List();
		DeleteRoomToSendEvent.emitter.subscribers = new List();
		UserCreatedEvent.emitter.subscribers = new List();
		HintGameChatMessageReceivedEvent.emitter.subscribers = new List();
		AddBotReceivedEvent.emitter.subscribers = new List();
		UserTrophyEvent.emitter.subscribers = new List();
		KickGameChatMessageReceivedEvent.emitter.subscribers = new List();
		VoteGameChatMessageReceivedEvent.emitter.subscribers = new List();
	}

	public start(): void {
		this.server.listen(this.port, () => {
			(console).log(`Server listening on port ${this.port}.`);
		});
	}

	public async clearDB(): Promise<void> {
		await this.userController.clear();
		await this.messageController.clear();
		await this.roomController.clear();
		await this.wordImagePairController.clear();
		await this.gameController.clear();
	}
}
