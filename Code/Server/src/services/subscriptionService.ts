/* eslint-disable max-lines-per-function */
import { KickGameChatMessageReceivedEvent, VoteGameChatMessageReceivedEvent } from "../events/anticheatEvent";
import {
	ChatMessageReceivedEvent,
	ChatMessageToSendEvent,
	GameChatMessageReceivedEvent,
} from "../events/chatEvents";
import {
	AuthenticationEvent,
	LoginEvent,
	LogoutEvent,
} from "../events/connectionEvents";
import {
	AppendToPathReceivedEvent,
	AppendToPathToSendEvent,
	CreateLobbyReceivedEvent,
	CreateLobbyToSendEvent,
	DeleteLobbyReceivedEvent,
	DeleteLobbyToSendEvent,
	EliminatePlayerToSendEvent,
	EndGameToSendEvent,
	EndRoundToSendEvent,
	GameInfoToSendEvent,
	GameTickToSendEvent,
	JoinGameSpectatorReceivedEvent,
	JoinGameSpectatorToSendEvent,
	JoinLobbyPlayerReceivedEvent,
	JoinLobbyPlayerToSendEvent,
	JoinLobbySpectatorReceivedEvent,
	JoinLobbySpectatorToSendEvent,
	KickPlayerReceivedEvent,
	LeaveGamePlayerReceivedEvent,
	LeaveGamePlayerToSendEvent,
	LeaveGameSpectatorReceivedEvent,
	LeaveGameSpectatorToSendEvent,
	LeaveLobbyPlayerReceivedEvent,
	LeaveLobbyPlayerToSendEvent,
	LeaveLobbySpectatorReceivedEvent,
	LeaveLobbySpectatorToSendEvent,
	LobbyInfoToSendEvent,
	SetPathReceivedEvent,
	SetPathToSendEvent,
	StartGameReceivedEvent,
	StartGameToSendEvent,
	StartRoundToSendEvent,
	UpdateLobbyToSendEvent,
	WordFoundToSendEvent,
	WordToDrawToSendEvent,
} from "../events/gameEvents";
import {
	CreateRoomReceivedEvent,
	CreateRoomToSendEvent,
	DeleteRoomReceivedEvent,
	DeleteRoomToSendEvent,
	JoinRoomReceivedEvent,
	JoinRoomToSendEvent,
	LeaveRoomReceivedEvent,
	LeaveRoomToSendEvent,
} from "../events/roomEvents";
import { UserCheatedEvent, UserTrophyEvent } from "../events/userEvents";
import { AddBotReceivedEvent, HintGameChatMessageReceivedEvent } from "../events/virtualPlayerEvents";
import { Statistics } from "../statistics/Statistics";
import { GameService } from "./Core/GameService";
import { RoomService } from "./Core/RoomService";
import { UserService } from "./Core/UserService";
import { SocketAuthenticatorService } from "./network/Socket/SocketAuthenticatorService";
import {
	SocketInterface,
	SocketServerInterface,
	SocketService,
} from "./network/Socket/SocketService";

export class SubscriptionService<
	Socket extends SocketInterface,
	SocketServer extends SocketServerInterface<Socket>
> {
	private roomService: RoomService;

	constructor(
		private socketService: SocketService<Socket, SocketServer>,
		private gameService: GameService,
		private userService: UserService<Socket>,
		private socketAuthenticationService: SocketAuthenticatorService<Socket>,
		private statistics: Statistics
	) {
		this.roomService = RoomService.getInstance();
	}

	public init(): void {
		this.listenToSocketReceive();
		this.listenToSendToSocket();
	}

	// not all events are meant to be for a socket or from a socket... there shouldnt be explicit instructions on the
	// event that indicate it is meant to be sent but since 90% of events generated from socket messages are
	// meant to generate a response to be also sent over socket, it was simpler to call events "_ToSendEvent" & "_ReceivedEvent"

	public listenToSocketReceive(): void {
		this.listenToChat();
		this.listenToLogin();
		this.listenToCreate();
		this.listenToDelete();
		this.listenToLogout();
		this.listenToGameChat();
		this.listenToJoinRoom();
        this.listenToLeaveRoom();
		this.listenToUserTrophy();
		this.listenToUserCheated();
		this.listenToAddBotReceived();
		this.listenToAuthentication();
		this.listenToSetPathReceived();
		this.listenToStartGameReceived();
		this.listenToKickPlayerReceived();
		this.listenToCreateLobbyReceived();
		this.listenToDeleteLobbyReceived();
		this.listenToAppendToPathReceived();
		this.listenToJoinLobbyPlayerReceived();
		this.listenToLeaveGamePlayerReceived();
		this.listenToLeaveLobbyPlayerReceived();
		this.listenToJoinGameSpectatorReceived();
		this.listenToJoinLobbySpectatorReceived();
		this.listenToLeaveGameSpectatorReceived();
		this.listenToHintGameChatMessageReceived();
		this.listenToKickGameChatMessageReceived();
		this.listenToVoteGameChatMessageReceived();
		this.listenToLeaveLobbySpectatorReceived();
	}

	public listenToSendToSocket(): void {
		this.listenToEndGameToSend();
		this.listenToSetPathToSend();
		this.listenToEndRoundToSend();
		this.listenToGameInfoToSend();
		this.listenToGameTickToSend();
		this.listenToJoinRoomToSend();
		this.listenToLeaveRoomToSend();
		this.listenToStartGameToSend();
		this.listenToWordFoundToSend();
		this.listenToLobbyInfoToSend();
		this.listenToCreateRoomToSend();
		this.listenToDeleteRoomToSend();
		this.listenToStartRoundToSend();
		this.listenToWordToDrawToSend();
		this.listenToUpdateLobbyToSend();
		this.listenToChatMessageToSend();
		this.listenToCreateLobbyToSend();
		this.listenToDeleteLobbyToSend();
		this.listenToAppendToPathToSend();
		this.listenToEliminatePlayerToSend();
		this.listenToJoinLobbyPlayerToSend();
		this.listenToLeaveGamePlayerToSend();
		this.listenToLeaveLobbyPlayerToSend();
		this.listenToJoinGameSpectatorToSend();
		this.listenToJoinLobbySpectatorToSend();
		this.listenToLeaveGameSpectatorToSend();
		this.listenToLeaveLobbySpectatorToSend();
	}

	private listenToAuthentication(): void {
		AuthenticationEvent.subscribe(
			async (ev: AuthenticationEvent<Socket>) => {
				await this.socketAuthenticationService.authenticate(ev);
			}
		);
	}

	private listenToJoinRoom(): void {
		JoinRoomReceivedEvent.subscribe(async (ev: JoinRoomReceivedEvent) => {
			await this.roomService.join(ev.username, ev.roomName);
		});
	}

	private listenToLeaveRoom(): void {
		LeaveRoomReceivedEvent.subscribe(async (ev: LeaveRoomReceivedEvent) => {
			await this.roomService.leave(ev.username, ev.roomName);
		});
	}

	private listenToCreate(): void {
		CreateRoomReceivedEvent.subscribe(
			async (ev: CreateRoomReceivedEvent) => {
				await this.roomService.createRoom(ev.roomName, ev.username);
			}
		);
	}

	private listenToDelete(): void {
		DeleteRoomReceivedEvent.subscribe(
			async (ev: DeleteRoomReceivedEvent) => {
				await this.roomService.deleteRoom(ev.roomName, ev.username);
			}
		);
	}

	private listenToLogin<Socket extends SocketInterface>(): void {
		// eslint-disable-next-line require-await
		LoginEvent.subscribe(async (ev: LoginEvent<Socket>) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			this.statistics.login(ev.username);
		});
		LoginEvent.subscribe(async (ev: LoginEvent<Socket>) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			await this.socketService.sendAuthenticate(ev);
		});
		LoginEvent.subscribe(async (ev: LoginEvent<Socket>) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			await this.userService.login(ev);
		});
		LoginEvent.subscribe(async (ev: LoginEvent<Socket>) => {
			await this.roomService.login(ev.username);
		});
	}

	private listenToLogout(): void {
		LogoutEvent.subscribe(async (ev: LogoutEvent) => {
			await this.statistics.logout(ev.user);
		});
		LogoutEvent.subscribe(async (ev: LogoutEvent) => {
			await this.roomService.logout(ev.user);
		});
		LogoutEvent.subscribe(async (ev: LogoutEvent) => {
			await this.userService.logout(ev.user);
		});
		LogoutEvent.subscribe(async (ev: LogoutEvent) => {
			await this.gameService.logout(ev.user);
		});
	}

	private listenToChat(): void {
		ChatMessageReceivedEvent.subscribe(
			async (ev: ChatMessageReceivedEvent) => {
				await this.roomService.chatMessageReceived(ev);
			}
		);
	}

	private listenToChatMessageToSend() {
		ChatMessageToSendEvent.subscribe(async (ev: ChatMessageToSendEvent) => {
			await this.socketService.sendChat(ev);
		});
	}

	private listenToJoinRoomToSend() {
		JoinRoomToSendEvent.subscribe(async (ev: JoinRoomToSendEvent) => {
			await this.socketService.sendJoinRoom(ev);
		});
	}

	private listenToLeaveRoomToSend() {
		LeaveRoomToSendEvent.subscribe(async (ev: LeaveRoomToSendEvent) => {
			await this.socketService.sendLeaveRoom(ev);
		});
	}

	private listenToCreateRoomToSend() {
		CreateRoomToSendEvent.subscribe(async (ev: CreateRoomToSendEvent) => {
			await this.socketService.sendCreateRoom(ev);
		});
	}

	private listenToDeleteRoomToSend() {
		DeleteRoomToSendEvent.subscribe(async (ev: DeleteRoomToSendEvent) => {
			await this.socketService.sendDeleteRoom(ev);
		});
	}

	private listenToCreateLobbyReceived() {
		CreateLobbyReceivedEvent.subscribe(
			async (ev: CreateLobbyReceivedEvent) => {
				await this.gameService.createLobby(
					ev.creator,
					ev.gameName,
					ev.gameMode,
					ev.difficulty,
					ev.avatar
				);
			}
		);
	}

	private listenToCreateLobbyToSend() {
		CreateLobbyToSendEvent.subscribe(async (ev: CreateLobbyToSendEvent) => {
			await this.socketService.sendCreateLobby(ev);
		});
	}

	private listenToJoinLobbyPlayerToSend() {
		JoinLobbyPlayerToSendEvent.subscribe(
			async (ev: JoinLobbyPlayerToSendEvent) => {
				await this.socketService.sendJoinLobbyPlayer(ev);
			}
		);
	}

	private listenToJoinLobbySpectatorToSend() {
		JoinLobbySpectatorToSendEvent.subscribe(
			async (ev: JoinLobbySpectatorToSendEvent) => {
				await this.socketService.sendJoinLobbySpectator(ev);
			}
		);
	}

	private listenToJoinLobbyPlayerReceived() {
		JoinLobbyPlayerReceivedEvent.subscribe(
			async (ev: JoinLobbyPlayerReceivedEvent) => {
				await this.gameService.joinLobbyPlayer(
					ev.lobbyName,
					ev.username,
					ev.avatar
				);
			}
		);
	}

	private listenToJoinLobbySpectatorReceived() {
		JoinLobbySpectatorReceivedEvent.subscribe(
			async (ev: JoinLobbySpectatorReceivedEvent) => {
				await this.gameService.joinLobbySpectator(
					ev.lobbyName,
					ev.username,
					ev.avatar
				);
			}
		);
	}

	private listenToLeaveLobbyPlayerReceived() {
		LeaveLobbyPlayerReceivedEvent.subscribe(
			async (ev: LeaveLobbyPlayerReceivedEvent) => {
				await this.gameService.leaveLobbyPlayer(ev.username);
			}
		);
	}

	private listenToLeaveLobbySpectatorReceived() {
		LeaveLobbySpectatorReceivedEvent.subscribe(
			async (ev: LeaveLobbySpectatorReceivedEvent) => {
				await this.gameService.leaveLobbySpectator(ev.username);
			}
		);
	}

	private listenToDeleteLobbyReceived() {
		DeleteLobbyReceivedEvent.subscribe(
			async (ev: DeleteLobbyReceivedEvent) => {
				await this.gameService.deleteLobbyRequest(ev.username);
			}
		);
	}

	private listenToLeaveLobbyPlayerToSend() {
		LeaveLobbyPlayerToSendEvent.subscribe(
			async (ev: LeaveLobbyPlayerToSendEvent) => {
				await this.socketService.sendLeaveLobbyPlayer(ev);
			}
		);
	}

	private listenToLeaveLobbySpectatorToSend() {
		LeaveLobbySpectatorToSendEvent.subscribe(
			async (ev: LeaveLobbySpectatorToSendEvent) => {
				await this.socketService.sendLeaveLobbySpectator(ev);
			}
		);
	}

	private listenToDeleteLobbyToSend() {
		DeleteLobbyToSendEvent.subscribe(async (ev: DeleteLobbyToSendEvent) => {
			await this.socketService.sendDeleteLobby(ev);
		});
	}

	private listenToStartGameReceived() {
		StartGameReceivedEvent.subscribe(async (ev: StartGameReceivedEvent) => {
			await this.gameService.startGameRequest(ev);
		});
	}

	private listenToStartGameToSend() {
		StartGameToSendEvent.subscribe(async (ev: StartGameToSendEvent) => {
			await this.socketService.sendStartGame(ev);
		});
	}

	private listenToStartRoundToSend() {
		StartRoundToSendEvent.subscribe(async (ev: StartRoundToSendEvent) => {
			await this.socketService.sendStartRound(ev);
		});
	}

	private listenToEndRoundToSend() {
		EndRoundToSendEvent.subscribe(async (ev: EndRoundToSendEvent) => {
			await this.socketService.sendEndRound(ev);
		});
	}

	private listenToWordToDrawToSend() {
		WordToDrawToSendEvent.subscribe(async (ev: WordToDrawToSendEvent) => {
			await this.socketService.sendWordToDraw(ev);
		});
	}

	private listenToSetPathReceived() {
		SetPathReceivedEvent.subscribe(async (ev: SetPathReceivedEvent) => {
			await this.gameService.setPath(ev);
		});
	}

	private listenToSetPathToSend() {
		SetPathToSendEvent.subscribe(async (ev: SetPathToSendEvent) => {
			await this.socketService.sendSetPath(ev);
		});
	}

	private listenToAppendToPathReceived() {
		AppendToPathReceivedEvent.subscribe(
			async (ev: AppendToPathReceivedEvent) => {
				await this.gameService.appendToPath(ev);
			}
		);
	}

	private listenToAppendToPathToSend() {
		AppendToPathToSendEvent.subscribe(
			async (ev: AppendToPathToSendEvent) => {
				await this.socketService.sendAppendToPath(ev);
			}
		);
	}

	private listenToWordFoundToSend() {
		WordFoundToSendEvent.subscribe(async (ev: WordFoundToSendEvent) => {
			await this.socketService.sendWordFound(ev);
		});
	}

	private listenToLobbyInfoToSend() {
		LobbyInfoToSendEvent.subscribe(async (ev: LobbyInfoToSendEvent) => {
			await this.socketService.sendLobbyInfo(ev);
		});
	}

	private listenToGameInfoToSend() {
		GameInfoToSendEvent.subscribe(async (ev: GameInfoToSendEvent) => {
			await this.socketService.sendGameInfo(ev);
		});
	}

	private listenToUpdateLobbyToSend() {
		UpdateLobbyToSendEvent.subscribe(async (ev: UpdateLobbyToSendEvent) => {
			await this.socketService.sendUpdateLobby(ev);
		});
	}

	private listenToGameChat() {
		GameChatMessageReceivedEvent.subscribe(
			async (ev: GameChatMessageReceivedEvent) => {
				await this.gameService.message(ev);
			}
		);
	}

	private listenToGameTickToSend() {
		GameTickToSendEvent.subscribe(async (ev: GameTickToSendEvent) => {
			await this.socketService.sendGameTick(ev);
		});
	}

	private listenToLeaveGamePlayerReceived() {
		LeaveGamePlayerReceivedEvent.subscribe(
			async (ev: LeaveGamePlayerReceivedEvent) => {
				const roomName = 'Lobby:' + this.gameService.gameByUser.get(ev.username)?.lobby.gameName;
				await this.gameService.leaveGamePlayer(ev.username, false);
				await new LeaveRoomReceivedEvent(ev.username, roomName).emit();
			}
		);
	}

	private listenToLeaveGamePlayerToSend() {
		LeaveGamePlayerToSendEvent.subscribe(
			async (ev: LeaveGamePlayerToSendEvent) => {
				await this.socketService.sendLeaveGamePlayer(ev);
			}
		);
	}

	private listenToJoinGameSpectatorReceived() {
		JoinGameSpectatorReceivedEvent.subscribe(
			async (ev: JoinGameSpectatorReceivedEvent) => {
				await this.gameService.joinGameSpectator(
					ev.gameName,
					ev.username
				);
				await new JoinRoomReceivedEvent(ev.username, 'Lobby:' + ev.gameName).emit();
			}
		);
	}

	private listenToJoinGameSpectatorToSend() {
		JoinGameSpectatorToSendEvent.subscribe(
			async (ev: JoinGameSpectatorToSendEvent) => {
				await this.socketService.sendJoinGameSpectator(ev);
			}
		);
	}

	private listenToEndGameToSend() {
		EndGameToSendEvent.subscribe(async (ev: EndGameToSendEvent) => {
			await this.statistics.endGame(ev);
		});
		EndGameToSendEvent.subscribe(async (ev: EndGameToSendEvent) => {
			await this.socketService.sendEndGame(ev);
		});
		EndGameToSendEvent.subscribe(async (ev: EndGameToSendEvent) => {
			await this.gameService.removeGameFromLists(ev.gameName);
		});
		EndGameToSendEvent.subscribe(async (ev: EndGameToSendEvent) => {
			await this.roomService.deleteRoom(
				"Lobby:" + ev.gameName,
				"",
				true,
				true
			);
		});
	}

	private listenToLeaveGameSpectatorReceived() {
		LeaveGameSpectatorReceivedEvent.subscribe(
			async (ev: LeaveGameSpectatorReceivedEvent) => {
				const roomName = 'Lobby:' + this.gameService.gameByUser.get(ev.username)?.lobby.gameName;
				await this.gameService.leaveGameSpectator(ev.username);
				await new LeaveRoomReceivedEvent(ev.username, roomName).emit();
			}
		);
	}

	private listenToLeaveGameSpectatorToSend() {
		LeaveGameSpectatorToSendEvent.subscribe(
			async (ev: LeaveGameSpectatorToSendEvent) => {
				await this.socketService.sendLeaveGameSpectator(ev);
			}
		);
	}

	private listenToAddBotReceived() {
		AddBotReceivedEvent.subscribe(async (ev: AddBotReceivedEvent) => {
			await this.gameService.addBot(ev);
		});
	}

	private listenToKickPlayerReceived() {
		KickPlayerReceivedEvent.subscribe(
			async (ev: KickPlayerReceivedEvent) => {
				await this.gameService.kickPlayer(ev);
			}
		);
	}

	private listenToEliminatePlayerToSend() {
		EliminatePlayerToSendEvent.subscribe(
			async (ev: EliminatePlayerToSendEvent) => {
				await this.socketService.SendEliminate(ev);
			}
		);
	}

	private listenToUserTrophy() {
		UserTrophyEvent.subscribe(async (ev: UserTrophyEvent) => {
			await this.statistics.addTrophy(ev);
		});
	}

	private listenToHintGameChatMessageReceived() {
		HintGameChatMessageReceivedEvent.subscribe(async (ev: HintGameChatMessageReceivedEvent) => {
			await this.gameService.sendHint(ev);
		})
	}

	private listenToKickGameChatMessageReceived() {
		KickGameChatMessageReceivedEvent.subscribe(async (ev: KickGameChatMessageReceivedEvent) => {
			await this.gameService.initiateVoteKick(ev);
		})
	}

	private listenToVoteGameChatMessageReceived() {
		VoteGameChatMessageReceivedEvent.subscribe(async (ev: VoteGameChatMessageReceivedEvent) => {
			await this.gameService.voteKick(ev);
		})
	}
	
	private listenToUserCheated() {
		// eslint-disable-next-line require-await
		UserCheatedEvent.subscribe(async (ev: UserCheatedEvent) => {
			this.socketAuthenticationService.cheated(ev.username);
		});
	}
}
