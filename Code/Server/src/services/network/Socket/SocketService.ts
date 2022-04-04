import { AuthenticationInfo, LoginCredential } from '../../../types/user';
import { UserService } from '../../Core/UserService';
import {
    ChatMessageReceivedEvent,
    ChatMessageToSendEvent,
    GameChatMessageReceivedEvent,
} from '../../../events/chatEvents';
import {
    LogoutEvent,
    AuthenticationEvent,
    LoginEvent,
} from '../../../events/connectionEvents';
import {
    CreateRoomReceivedEvent,
    CreateRoomToSendEvent,
    DeleteRoomReceivedEvent,
    DeleteRoomToSendEvent,
    JoinRoomReceivedEvent,
    JoinRoomToSendEvent,
    LeaveRoomReceivedEvent,
    LeaveRoomToSendEvent,
} from '../../../events/roomEvents';
import { DeleteLobbyOrGameMessageToSend, LobbyCreateMessageReceived, LobbyCreateMessageToSend, LobbyJoinMessageReceived, LobbyLeaveMessageToSend, LobbyJoinMessageToSend, StartRoundMessageToSend, EndRoundMessageToSend, WordToDrawMessageToSend, AppendToPathMessage, SetPathMessage, WordFoundMessage, LobbyInfoMessage, UpdateLobbyMessage, GameJoinMessageReceived, GameJoinMessageToSend, GameLeaveMessageToSend, GameTickToSend, KickPlayerRequest, GameInfoMessage } from '../../../types/game';
import { CreateLobbyReceivedEvent, CreateLobbyToSendEvent, DeleteLobbyReceivedEvent, DeleteLobbyToSendEvent, LeaveLobbyPlayerToSendEvent, LeaveLobbySpectatorToSendEvent, JoinLobbyPlayerReceivedEvent, JoinLobbySpectatorReceivedEvent, JoinLobbyPlayerToSendEvent, JoinLobbySpectatorToSendEvent, LeaveLobbyPlayerReceivedEvent, LeaveLobbySpectatorReceivedEvent, StartGameReceivedEvent, StartGameToSendEvent, StartRoundToSendEvent, EndRoundToSendEvent, EndGameToSendEvent, WordToDrawToSendEvent, SetPathReceivedEvent, AppendToPathReceivedEvent, SetPathToSendEvent, AppendToPathToSendEvent, WordFoundToSendEvent, LobbyInfoToSendEvent, UpdateLobbyToSendEvent, JoinGameSpectatorReceivedEvent, LeaveGamePlayerReceivedEvent, LeaveGameSpectatorReceivedEvent, JoinGameSpectatorToSendEvent, LeaveGamePlayerToSendEvent, LeaveGameSpectatorToSendEvent, GameTickToSendEvent, KickPlayerReceivedEvent, GameInfoToSendEvent, EliminatePlayerToSendEvent } from '../../../events/gameEvents';
import { ChatMessageReceived, ChatMessageToSend, RoomCreateReceived, RoomCreateToSend, RoomDeleteReceived, RoomDeleteToSend, RoomJoinReceived, RoomJoinToSend, RoomLeaveReceived, RoomLeaveToSend } from '../../../types/message';
import { KnownError } from '../../../errors/generic';
import { AddBotReceivedEvent, HintGameChatMessageReceivedEvent } from '../../../events/virtualPlayerEvents';
import { KickGameChatMessageReceivedEvent, VoteGameChatMessageReceivedEvent } from '../../../events/anticheatEvent';
import { List } from '../../../List';
import { UserCheatedEvent } from '../../../events/userEvents';

const HELP_MESSAGES = [
	"COMMAND LIST",
	"/kick player: initiates a votekick against player, must vote with /yes or /no before 60s",
	"/hint: gives out one of the hints associated to the drawing",
	"/help: displays this message",
];

export interface SocketServerInterface<Socket> {
    on: (Ty: string, callback: (socket: Socket) => void) => void;
}

export interface SocketInterface {
    on: (Ty: string, callback: (param: any) => Promise<void>) => void;
    emit: (Ty: string, param?: any) => void;
    id: string;
}

export class SocketService<Socket extends SocketInterface, SocketServer extends SocketServerInterface<Socket>> {
    constructor(
        public userService: UserService<Socket>,
        public io: SocketServer,
    ) { }

    public init(): void {
        this.io.on('connection', (socket: Socket) => {
            (console).log(`client connection : ${socket.id}\ntime = ${new Date().toString()}`);
            this.listen(socket);
        });
    }

    listen(socket: Socket): void {
        socket.on('UserLogin', (credentials: LoginCredential) => this.handleErrors(socket, () => this.socketUserLogin(socket, credentials), "socketUserLogin"));
        socket.on('disconnect', () => this.handleErrors(socket, () => this.socketDisconnect(socket), "socketDisconnect"));
        socket.on('UserLogout', () => this.handleErrors(socket, () => this.socketDisconnect(socket), "socketDisconnect"));
        socket.on('ChatMessage', (msg: ChatMessageReceived) => this.handleErrors(socket, () => this.socketChat(socket, msg), "socketChat"));
        socket.on('CreateRoom', (msg: RoomCreateReceived) => this.handleErrors(socket, () => this.socketCreateRoom(socket, msg), "socketCreateRoom"));
        socket.on('JoinRoom', (msg: RoomJoinReceived) => this.handleErrors(socket, () => this.socketJoinRoom(socket, msg), "socketJoinRoom"));
        socket.on('LeaveRoom', (msg: RoomLeaveReceived) => this.handleErrors(socket, () => this.socketLeaveRoom(socket, msg), "socketLeaveRoom"));
        socket.on('DeleteRoom', (msg: RoomDeleteReceived) => this.handleErrors(socket, () => this.socketDeleteRoom(socket, msg), "socketDeleteRoom"));
        socket.on('SetPath', (msg: SetPathMessage) => this.handleErrors(socket, () => this.socketSetPath(socket, msg), "socketSetPath"));
        socket.on('AppendToPath', (msg: AppendToPathMessage) => this.handleErrors(socket, () => this.socketAppendToPath(socket, msg), "socketAppendToPath"));
        socket.on('CreateLobby', (msg: LobbyCreateMessageReceived) => this.handleErrors(socket, () => this.socketCreateLobby(socket, msg), "socketCreateLobby"));
        socket.on('JoinLobbyPlayer', (msg: LobbyJoinMessageReceived) => this.handleErrors(socket, () => this.socketJoinLobbyPlayer(socket, msg), "socketJoinLobbyPlayer"));
        socket.on('JoinLobbySpectator', (msg: LobbyJoinMessageReceived) => this.handleErrors(socket, () => this.socketJoinLobbySpectator(socket, msg), "socketJoinLobbySpectator"));
        socket.on('JoinGameSpectator', (msg: GameJoinMessageReceived) => this.handleErrors(socket, () => this.socketJoinGameSpectator(socket, msg), "socketJoinGameSpectator"));
        socket.on('LeaveLobbyPlayer', () => this.handleErrors(socket, () => this.socketLeaveLobbyPlayer(socket), "socketLeaveLobbyPlayer"));
        socket.on('LeaveGamePlayer', () => this.handleErrors(socket, () => this.socketLeaveGamePlayer(socket), "socketLeaveGamePlayer"));
        socket.on('LeaveGameSpectator', () => this.handleErrors(socket, () => this.socketLeaveGameSpectator(socket), "socketLeaveGameSpectator"));
        socket.on('LeaveLobbySpectator', () => this.handleErrors(socket, () => this.socketLeaveLobbySpectator(socket), "socketLeaveLobbySpectator"));
        socket.on('DeleteLobby', () => this.handleErrors(socket, () => this.socketDeleteLobby(socket), "socketDeleteLobby"));
        socket.on('StartGame', () => this.handleErrors(socket, () => this.socketStartGame(socket), "socketStartGame"));
        socket.on('AddBot', () => this.handleErrors(socket, () => this.socketAddBot(socket), "socketAddBot"));
        socket.on('KickPlayer', (msg: KickPlayerRequest) => this.handleErrors(socket, () => this.socketKickPlayer(socket, msg), "socketKickPlayer"));
        socket.on('UserCheated', () => this.handleErrors(socket, () => this.socketUserCheated(socket), "socketUserCheated"));
    }

    private handleErrors = async (socket: Socket, f: any, s: string) => {
        try {
            (console).log(s, new Date().toString());
            await f();
        } catch (e) {
            (console).log(e);
            if (e instanceof KnownError)
                socket.emit(e.name);
            else
                socket.emit('Error');
        }
    }

    async socketUserLogin(socket: Socket, credentials: LoginCredential): Promise<void> {
        await new AuthenticationEvent(socket, credentials).emit();
    }

    async socketDisconnect(socket: Socket): Promise<void> {
        await new LogoutEvent(this.userService.getUserBySocket(socket)).emit();
    }

    async socketStartGame(socket: Socket): Promise<void> {
        await new StartGameReceivedEvent(this.userService.getUserBySocket(socket)).emit();
    }

    async socketSetPath(socket: Socket, msg: SetPathMessage): Promise<void> {
        await new SetPathReceivedEvent(this.userService.getUserBySocket(socket), msg.pathId, msg.color, msg.strokeWidth, msg.path, msg.canvasSize).emit();
    }

    async socketAppendToPath(socket: Socket, msg: AppendToPathMessage): Promise<void> {
        await new AppendToPathReceivedEvent(this.userService.getUserBySocket(socket), msg.x, msg.y).emit();
    }

    async socketChat(socket: Socket, msg: ChatMessageReceived): Promise<void> {
        const userAndAvatar = this.userService.getUserAndAvatarBySocket(socket);
        if (msg.roomName.startsWith('Lobby:'))
            if (msg.content.startsWith('/'))
                await this.checkIfCommand(userAndAvatar, msg)
            else
                await new GameChatMessageReceivedEvent(userAndAvatar.username, msg.roomName, msg.content, new Date(), userAndAvatar.avatar).emit();
        else
            await new ChatMessageReceivedEvent(userAndAvatar.username, msg.roomName, msg.content, new Date(), userAndAvatar.avatar).emit();
    }

    async checkIfCommand(userAndAvatar: {username: string, avatar: number}, msg: ChatMessageReceived) {
        if (msg.content == '/hint')
            await new HintGameChatMessageReceivedEvent(userAndAvatar.username, msg.roomName).emit();           
        else if (msg.content.startsWith('/kick ') && msg.content.split(' ').length == 2)
            await new KickGameChatMessageReceivedEvent(userAndAvatar.username, msg.roomName, msg.content.split(' ')[1]).emit()
        else if (msg.content == '/yes' || msg.content == '/no')
            await new VoteGameChatMessageReceivedEvent(userAndAvatar.username, msg.roomName, msg.content == '/yes' ? true : false).emit()
        else if (msg.content == '/help') {
            await HELP_MESSAGES.forEach(async (content:string)=> {
                const message = { _id: 'hopefully', author: "bot_COMMAND", roomName: msg.roomName, content: content, timestamp: new Date().toString(), avatar: 0} as ChatMessageToSend;
                await new ChatMessageToSendEvent(new List([userAndAvatar.username]),message).emit()
            })
        }
        else {
            const message = { _id: 'hopefully', author: "bot_COMMAND", roomName: msg.roomName, content: 'Invalid command, type /help for thorough list', timestamp: new Date().toString(), avatar: 0} as ChatMessageToSend;
            await new ChatMessageToSendEvent(new List([userAndAvatar.username]), message).emit() 
        }
    }

    async socketCreateRoom(socket: Socket, msg: RoomCreateReceived): Promise<void> {
        await new CreateRoomReceivedEvent(this.userService.getUserBySocket(socket), msg.roomName).emit();
    }

    async socketJoinRoom(socket: Socket, msg: RoomJoinReceived): Promise<void> {
        await new JoinRoomReceivedEvent(this.userService.getUserBySocket(socket), msg.roomName).emit();
    }

    async socketLeaveRoom(socket: Socket, msg: RoomLeaveReceived): Promise<void> {
        await new LeaveRoomReceivedEvent(this.userService.getUserBySocket(socket), msg.roomName).emit();
    }

    async socketDeleteRoom(socket: Socket, msg: RoomDeleteReceived): Promise<void> {
        await new DeleteRoomReceivedEvent(this.userService.getUserBySocket(socket), msg.roomName).emit();
    }

    async socketCreateLobby(socket: Socket, msg: LobbyCreateMessageReceived): Promise<void> {
        const userAndAvatar = this.userService.getUserAndAvatarBySocket(socket);
        await new CreateLobbyReceivedEvent(userAndAvatar.username, msg.gameName, msg.gameMode, msg.difficulty, userAndAvatar.avatar).emit();
    }

    async socketJoinLobbyPlayer(socket: Socket, msg: LobbyJoinMessageReceived): Promise<void> {
        const userAndAvatar = this.userService.getUserAndAvatarBySocket(socket);
        await new JoinLobbyPlayerReceivedEvent(userAndAvatar.username, msg.gameName, userAndAvatar.avatar).emit();
    }

    async socketJoinLobbySpectator(socket: Socket, msg: LobbyJoinMessageReceived): Promise<void> {
        const userAndAvatar = this.userService.getUserAndAvatarBySocket(socket);
        await new JoinLobbySpectatorReceivedEvent(userAndAvatar.username, msg.gameName, userAndAvatar.avatar).emit();
    }

    async socketLeaveLobbyPlayer(socket: Socket): Promise<void> {
        await new LeaveLobbyPlayerReceivedEvent(this.userService.getUserBySocket(socket)).emit();
    }

    async socketLeaveLobbySpectator(socket: Socket): Promise<void> {
        await new LeaveLobbySpectatorReceivedEvent(this.userService.getUserBySocket(socket)).emit();
    }

    async socketDeleteLobby(socket: Socket): Promise<void> {
        await new DeleteLobbyReceivedEvent(this.userService.getUserBySocket(socket)).emit();
    }

    async socketJoinGameSpectator(socket: Socket, msg: GameJoinMessageReceived): Promise<void> {
        await new JoinGameSpectatorReceivedEvent(this.userService.getUserBySocket(socket), msg.gameName).emit();
    }

    async socketLeaveGamePlayer(socket: Socket): Promise<void> {
        await new LeaveGamePlayerReceivedEvent(this.userService.getUserBySocket(socket)).emit();
    }

    async socketLeaveGameSpectator(socket: Socket): Promise<void> {
        await new LeaveGameSpectatorReceivedEvent(this.userService.getUserBySocket(socket)).emit();
    }

    async socketAddBot(socket: Socket): Promise<void> {
        await new AddBotReceivedEvent(this.userService.getUserBySocket(socket)).emit();
    }

    async socketKickPlayer(socket: Socket, msg: KickPlayerRequest): Promise<void> {
        await new KickPlayerReceivedEvent(this.userService.getUserBySocket(socket), msg.username).emit();
    }

    async socketUserCheated(socket: Socket): Promise<void> {
        await new UserCheatedEvent(this.userService.getUserBySocket(socket)).emit();
    }
    
    async sendChat(ev: ChatMessageToSendEvent): Promise<void> {
        await ev.receivers.foreach(async (receiver: string) => {
            await this.userService.getSocketByUsername(receiver).emit('ChatMessage', ev.message);
        });
    }

    async sendAuthenticate(ev: LoginEvent<Socket>): Promise<void> {
        const msg: AuthenticationInfo = {
            firstName: ev.firstName,
            lastName: ev.lastName,
            hashSocketId: ev.hashSocketId,
            avatar: ev.avatar,
            theme: '',
            firstTime: ev.firstTime,
        }
        await ev.socket.emit('UserAuthenticated', msg);
    }

    async sendJoinRoom(ev: JoinRoomToSendEvent): Promise<void> {
        const msg: RoomJoinToSend = {
            username: ev.username,
            roomName: ev.roomName,
            creator: ev.creator,
        };
        await ev.receivers.foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('JoinRoom', msg);
            } catch (e) {
                (console).log(e);
            }
        });
    }

    async sendLeaveRoom(ev: LeaveRoomToSendEvent): Promise<void> {
        const msg: RoomLeaveToSend = {
            username: ev.username,
            roomName: ev.roomName,
        };
        await ev.receivers.foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('LeaveRoom', msg);
            } catch (e) {
                (console).log(e);
            }
        });
    }

    async sendCreateRoom(ev: CreateRoomToSendEvent): Promise<void> {
        const msg: RoomCreateToSend = {
            username: ev.username,
            roomName: ev.roomName,
        };
        await this.userService.getAllUsers().foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('CreateRoom', msg);
            } catch (e) {
                (console).log(e);
            }
        });
    }

    async sendDeleteRoom(ev: DeleteRoomToSendEvent): Promise<void> {
        const msg: RoomDeleteToSend = {
            roomName: ev.roomName,
        };
        await this.userService.getAllUsers().foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('DeleteRoom', msg);
            } catch (e) {
                (console).log(e);
            }
        });
    }

    async sendCreateLobby(ev: CreateLobbyToSendEvent): Promise<void> {
        const msg: LobbyCreateMessageToSend = {
            gameName: ev.gameName,
            gameMode: ev.gameMode,
            difficulty: ev.difficulty,
            username: ev.creator,
        };
        await this.userService.getAllUsers().foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('CreateLobby', msg);
            } catch (e) {
                (console).log(e);
            }
        });
    }

    async sendJoinLobbyPlayer(ev: JoinLobbyPlayerToSendEvent): Promise<void> {
        const msg: LobbyJoinMessageToSend = {
            username: ev.username,
            gameName: ev.gameName,
            avatar: ev.avatar,
        };
        await ev.receivers.foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('JoinLobbyPlayer', msg);
            } catch (e) {
                (console).log(e);
            }
        });
    }

    async sendJoinLobbySpectator(ev: JoinLobbySpectatorToSendEvent): Promise<void> {
        const msg: LobbyJoinMessageToSend = {
            username: ev.username,
            gameName: ev.gameName,
            avatar: ev.avatar,
        };
        await ev.receivers.foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('JoinLobbySpectator', msg);
            } catch (e) {
                (console).log(e);
            }
        });
    }

    async sendJoinGameSpectator(ev: JoinGameSpectatorToSendEvent): Promise<void> {
        const msg: GameJoinMessageToSend = {
            username: ev.username,
        };
        await ev.receivers.foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('JoinGameSpectator', msg);
            } catch (e) {
                (console).log(e);
            }
        });
    }

    async sendDeleteLobby(ev: DeleteLobbyToSendEvent): Promise<void> {
        const msg: DeleteLobbyOrGameMessageToSend = {
            gameName: ev.roomName,
        };
        await this.userService.getAllUsers().foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('DeleteLobby', msg);
            } catch (e) {
                (console).log(e);
            }
        });
    }

    async sendLeaveLobbyPlayer(ev: LeaveLobbyPlayerToSendEvent): Promise<void> {
        const msg: LobbyLeaveMessageToSend = {
            username: ev.username,
        };
        await ev.receivers.foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('LeaveLobbyPlayer', msg);
            } catch (e) {
                (console).log(e);
            }
        });
    }

    async sendLeaveGamePlayer(ev: LeaveGamePlayerToSendEvent): Promise<void> {
        const msg: GameLeaveMessageToSend = {
            username: ev.username,
        };
        await ev.receivers.foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('LeaveGamePlayer', msg);
            } catch (e) {
                (console).log(e);
            }
        });
    }

    async sendLeaveLobbySpectator(ev: LeaveLobbySpectatorToSendEvent): Promise<void> {
        const msg: LobbyLeaveMessageToSend = {
            username: ev.username,
        };
        await ev.receivers.foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('LeaveLobbySpectator', msg);
            } catch (e) {
                (console).log(e);
            }
        });
    }

    async sendLeaveGameSpectator(ev: LeaveGameSpectatorToSendEvent): Promise<void> {
        const msg: GameLeaveMessageToSend = {
            username: ev.username,
        };
        await ev.receivers.foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('LeaveGameSpectator', msg);
            } catch (e) {
                (console).log(e);
            }
        });
    }

    async sendStartGame(ev: StartGameToSendEvent): Promise<void> {
        await this.userService.getAllUsers().foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('StartGame', {
                    gameName: ev.gameName
                });
            } catch (e) {
                (console).log(e);
            }
        });
    }

    async sendEndGame(ev: EndGameToSendEvent): Promise<void> {
        await this.userService.getAllUsers().foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('EndGame', {gameName: ev.gameName});
            } catch (e) {
                (console).log(e);
            }
        });
    }

    async sendStartRound(ev: StartRoundToSendEvent): Promise<void> {
        const msg: StartRoundMessageToSend = {
            artist: ev.artist,
        }
        await ev.receivers.foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('StartRound', msg);
            } catch (e) {
                (console).log(e);
            }
        });
    }

    async sendEndRound(ev: EndRoundToSendEvent): Promise<void> {
        const msg: EndRoundMessageToSend = {
            scores: ev.scores.getArray(),
            word: ev.word,
        }
        await ev.receivers.foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('EndRound', msg);
            } catch (e) {
                (console).log(e);
            }
        });
    }

    async sendWordToDraw(ev: WordToDrawToSendEvent): Promise<void> {
        const msg: WordToDrawMessageToSend = {
            word: ev.word,
        }
        await this.userService.getSocketByUsername(ev.receiver).emit('WordToDraw', msg);
    }

    async sendSetPath(ev: SetPathToSendEvent): Promise<void> {
        const msg: SetPathMessage = {
            pathId: ev.pathId,
            path: ev.path,
            strokeWidth: ev.strokeWidth,
            canvasSize: ev.canvasSize,
            color: ev.color,
        }
        await ev.receivers.foreach(async (receiver: string) => {
            try {
                if (!receiver.startsWith('bot_'))
                    await this.userService.getSocketByUsername(receiver).emit('SetPath', msg);
            } catch (e) {
                (console).log(e);
            }
        });
    }

    async sendAppendToPath(ev: AppendToPathToSendEvent): Promise<void> {
        const msg: AppendToPathMessage = {
            x: ev.x,
            y: ev.y,
        }
        await ev.receivers.foreach(async (receiver: string) => {
            try {
                if (!receiver.startsWith('bot_'))
                    await this.userService.getSocketByUsername(receiver).emit('AppendToPath', msg);
            } catch (e) {
                (console).log(receiver, e);
            }
        });
    }

    async sendWordFound(ev: WordFoundToSendEvent): Promise<void> {
        const pairWithAvatar = (player: string) => {
            return {
                username: player,
                avatar: this.userService.getAvatarByUsername(player),
            }
        }
        const msg: WordFoundMessage = pairWithAvatar(ev.username);
        await ev.receivers.foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('WordFound', msg);
            } catch (e) {
                (console).log(e);
            }
        });
    }

    async sendUpdateLobby(ev: UpdateLobbyToSendEvent): Promise<void> {
        const msg: UpdateLobbyMessage = {
            gameName: ev.gameName,
            playerCount: ev.playerCount,
        }
        await this.userService.getAllUsers().foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('UpdateLobby', msg);
            } catch (e) {
                (console).log(e);
            }
        });
    }

    async sendLobbyInfo(ev: LobbyInfoToSendEvent): Promise<void> {
        const pairWithAvatar = (player: string) => {
            return {
                username: player,
                avatar: this.userService.getAvatarByUsername(player),
            }
        }
        const msg: LobbyInfoMessage = {
            // eslint-disable-next-line require-await
            players: (await ev.players.map(pairWithAvatar)).getArray(),
            spectators: (await ev.spectators.map(pairWithAvatar)).getArray(),
        }
        await this.userService.getSocketByUsername(ev.receiver).emit('LobbyInfo', msg);
    }

    async sendGameInfo(ev: GameInfoToSendEvent): Promise<void> {
        const msg: GameInfoMessage = {
            scores: ev.scores.getArray(),
        }
        await this.userService.getSocketByUsername(ev.receiver).emit('GameInfo', msg);
    }

    async sendGameTick(ev: GameTickToSendEvent): Promise<void> {
        const msg: GameTickToSend = {
            timeLeft: ev.timeLeft,
        }
        await ev.receivers.foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('GameTick', msg);
            } catch (e) {
                (console).log(e);
            }
        });
    }
    
    async SendEliminate(ev: EliminatePlayerToSendEvent): Promise<void> {
        const msg = {
            username: ev.user
        }
        await ev.receivers.foreach(async (receiver: string) => {
            try {
                await this.userService.getSocketByUsername(receiver).emit('Eliminate', msg);
            } catch (e) {
                (console).log(e);
            }
        });
    }
}
