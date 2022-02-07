import { List } from "../List";
import { EventEmitter } from "../EventEmitter";
import {
	Difficulty,
	GameInfo,
	GameType,
	UsernameScoreAvatar,
} from "../types/game";
import { AbstractEvent } from "./AbstractEvent";

export class CreateLobbyReceivedEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await CreateLobbyReceivedEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(
		public creator: string,
		public gameName: string,
		public gameMode: string,
		public difficulty: string,
		public avatar: number
	) {
		super();
	}
}

export class CreateLobbyToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await CreateLobbyToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(
		public creator: string,
		public gameName: string,
		public gameMode: string,
		public difficulty: string
	) {
		super();
	}
}

export class StartGameReceivedEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await StartGameReceivedEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public username: string) {
		super();
	}
}

export class StartGameToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await StartGameToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public gameName: string) {
		super();
	}
}

export class JoinLobbyPlayerReceivedEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await JoinLobbyPlayerReceivedEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(
		public username: string,
		public lobbyName: string,
		public avatar: number
	) {
		super();
	}
}

export class JoinLobbySpectatorReceivedEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await JoinLobbySpectatorReceivedEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(
		public username: string,
		public lobbyName: string,
		public avatar: number
	) {
		super();
	}
}

export class JoinLobbySpectatorToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await JoinLobbySpectatorToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(
		public receivers: List<string>,
		public username: string,
		public gameName: string,
		public avatar: number
	) {
		super();
	}
}

export class JoinLobbyPlayerToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await JoinLobbyPlayerToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(
		public receivers: List<string>,
		public username: string,
		public gameName: string,
		public avatar: number
	) {
		super();
	}
}

export class UpdateLobbyToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await UpdateLobbyToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public gameName: string, public playerCount: number) {
		super();
	}
}

export class LobbyInfoToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await LobbyInfoToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(
		public receiver: string,
		public players: List<string>,
		public spectators: List<string>
	) {
		super();
	}
}

export class GameInfoToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await GameInfoToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(
		public receiver: string,
		public scores: List<UsernameScoreAvatar>
	) {
		super();
	}
}

export class LeaveLobbyPlayerReceivedEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await LeaveLobbyPlayerReceivedEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public username: string) {
		super();
	}
}

export class LeaveLobbySpectatorReceivedEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await LeaveLobbySpectatorReceivedEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public username: string) {
		super();
	}
}

export class LeaveGameSpectatorReceivedEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await LeaveGameSpectatorReceivedEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public username: string) {
		super();
	}
}

export class LeaveLobbyPlayerToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await LeaveLobbyPlayerToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public receivers: List<string>, public username: string) {
		super();
	}
}

export class LeaveGamePlayerToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await LeaveGamePlayerToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public receivers: List<string>, public username: string) {
		super();
	}
}

export class LeaveLobbySpectatorToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await LeaveLobbySpectatorToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public receivers: List<string>, public username: string) {
		super();
	}
}

export class LeaveGameSpectatorToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await LeaveGameSpectatorToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public receivers: List<string>, public username: string) {
		super();
	}
}

export class EndGameToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await EndGameToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(
		public gameName: string,
		public timestamp: Date,
		public totalTime: number,
		public scores: List<UsernameScoreAvatar>,
		public difficulty: string,
		public type: GameType
	) {
		super();
	}

	toGameInfo(): GameInfo {
		return {
			name: this.gameName,
			timestamp: this.timestamp,
			totalTime: this.totalTime,
			score: this.scores,
			gameType: this.type,
			difficulty: Difficulty[this.difficulty],
		};
	}
}

export class DeleteLobbyReceivedEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await DeleteLobbyReceivedEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public username: string) {
		super();
	}
}

export class DeleteLobbyToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await DeleteLobbyToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public roomName: string) {
		super();
	}
}

export class StartRoundToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await StartRoundToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public receivers: List<string>, public artist: string) {
		super();
	}
}

export class EndRoundToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await EndRoundToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(
		public receivers: List<string>,
		public scores: List<UsernameScoreAvatar>,
		public word: string
	) {
		super();
	}
}

export class WordToDrawToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await WordToDrawToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public receiver: string, public word: string) {
		super();
	}
}

export class SetPathReceivedEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await SetPathReceivedEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(
		public username: string,
		public pathId: number,
		public color: string,
		public strokeWidth: number,
		public path: string,
		public canvasSize: number
	) {
		super();
	}
}

export class SetPathToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await SetPathToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(
		public receivers: List<string>,
		public pathId: number,
		public color: string,
		public strokeWidth: number,
		public path: string,
		public canvasSize: number
	) {
		super();
	}
}

export class AppendToPathReceivedEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await AppendToPathReceivedEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public username: string, public x: number, public y: number) {
		super();
	}
}

export class AppendToPathToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await AppendToPathToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(
		public receivers: List<string>,
		public x: number,
		public y: number
	) {
		super();
	}
}

export class WordFoundToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await WordFoundToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public receivers: List<string>, public username: string) {
		super();
	}
}

export class LeaveGamePlayerReceivedEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await LeaveGamePlayerReceivedEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public username: string) {
		super();
	}
}

export class JoinGameSpectatorReceivedEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await JoinGameSpectatorReceivedEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public username: string, public gameName: string) {
		super();
	}
}

export class JoinGameSpectatorToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await JoinGameSpectatorToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public receivers: List<string>, public username: string) {
		super();
	}
}

export class GameTickToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await GameTickToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public receivers: List<string>, public timeLeft: number) {
		super();
	}
}

export class KickPlayerReceivedEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await KickPlayerReceivedEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public author: string, public target: string) {
		super();
	}
}

export class EliminatePlayerToSendEvent extends AbstractEvent {
	public static emitter: EventEmitter = new EventEmitter();
	public async emit(): Promise<void> {
		await EliminatePlayerToSendEvent.emitter.emit(this);
	}
	public static subscribe(f: (ev: AbstractEvent) => Promise<void>) {
		this.emitter.subscribe(f);
	}

	constructor(public receivers: List<string>, public user: string) {
		super();
	}
}
