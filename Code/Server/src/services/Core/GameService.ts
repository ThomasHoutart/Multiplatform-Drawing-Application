import { GameDoesNotExistError, NotEnoughPlayersError, UserAlreadyInGameError, UserNotInGameError } from "../../errors/game";
import { PermissionError } from "../../errors/generic";
import { LobbyAlreadyExistsError, LobbyDoesNotExistError, UserAlreadyInLobbyError, UserNotInLobbyError } from "../../errors/lobby";
import { KickGameChatMessageReceivedEvent, VoteGameChatMessageReceivedEvent } from "../../events/anticheatEvent";
import { ChatMessageReceivedEvent, GameChatMessageReceivedEvent } from "../../events/chatEvents";
import { AppendToPathReceivedEvent, AppendToPathToSendEvent, CreateLobbyToSendEvent, DeleteLobbyToSendEvent, KickPlayerReceivedEvent, SetPathReceivedEvent, SetPathToSendEvent, StartGameReceivedEvent, StartGameToSendEvent } from "../../events/gameEvents";
import { AddBotReceivedEvent, HintGameChatMessageReceivedEvent } from "../../events/virtualPlayerEvents";
import { BRGame } from "../../game/BRGame";
import { FFAGame } from "../../game/FFAGame";
import { Game } from "../../game/game";
import { Lobby } from "../../game/lobby";
import { List } from "../../List";
import { VirtualTieBreaker } from "../../virtualPlayer/personalities/VirtualTieBreaker";
import { VirtualPlayer } from "../../virtualPlayer/virtualPlayer";
import { RoomService } from "./RoomService";

export class GameService {
    public gameByUser: Map<string, Game>;
    public lobbyByUser: Map<string, Lobby>;
    public games: List<Game>;
    public lobbies: List<Lobby>
    private roomService: RoomService;

    constructor(public avatarByUsername: (username: string) => number) {
        this.games = new List();
        this.lobbies = new List();
        this.gameByUser = new Map();
        this.lobbyByUser = new Map();
        this.roomService = RoomService.getInstance();
    }

    public async startGame(lobby: Lobby): Promise<void> {
        if (lobby.players.length() < 2)
            throw new NotEnoughPlayersError();
        const game = this.getGame(lobby);
        this.games.push(game);
        this.lobbies.remove(lobby);
        await game.start();
        await new StartGameToSendEvent(lobby.gameName).emit();
        // eslint-disable-next-line require-await
        await lobby.participants.foreach(async (p: string) => {
            this.gameByUser.set(p, game);
            this.lobbyByUser.delete(p);
        });
        // eslint-disable-next-line require-await
        await lobby.virtualPlayers.foreach(async vp => {
            this.gameByUser.set(vp.personality.name, game);
            this.lobbyByUser.delete(vp.personality.name);
        });
    }

    public getGame(lobby: Lobby): Game {
        switch (lobby.gameMode) {
            case 'FFA':
                return new FFAGame(lobby, lobby.difficulty, this.avatarByUsername);
            case 'BR' :
                return new BRGame(lobby, lobby.difficulty, this.avatarByUsername);
            default:
                throw  new Error('bad gamemode');
        }
    }

    public async createLobby(player: string, gameName: string, gameMode: string, difficulty: string, avatar: number): Promise<void> {
        if (this.lobbyByUser.get(player))
            throw new UserAlreadyInLobbyError();
        if (this.gameByUser.get(player))
            throw new UserAlreadyInGameError();
        if (this.lobbies.find(lobby => lobby.gameName == gameName) || this.games.find(game => game.lobby.gameName == gameName))
            throw new LobbyAlreadyExistsError();
        const lobbyRoom = 'Lobby:' + gameName;
        if (this.roomService.rooms.has(lobbyRoom))
            throw new LobbyAlreadyExistsError();
        const lobby = new Lobby(gameName, gameMode, difficulty, player);
        await new CreateLobbyToSendEvent(player, gameName, gameMode, difficulty).emit();
        this.lobbies.push(lobby);
        this.lobbyByUser.set(player, lobby);
        await lobby.joinPlayer(player, avatar, true);
        await this.roomService.createRoom(lobbyRoom, player, true, true);
        if (gameMode != 'BR')
            return;
        const personality = new VirtualTieBreaker()
        this.lobbyByUser.set(personality.name, lobby);
        await lobby.joinVirtualPlayer(new VirtualPlayer(lobby.difficulty, personality));
    }

    public async leaveGamePlayer(user: string, logout = false): Promise<void> {
        const game = this.gameByUser.get(user);
        if (!game || !game.lobby.playersAndVirtualPlayers.has(user))
            throw new UserNotInGameError();
        this.gameByUser.delete(user);
        return await game.leavePlayer(user, logout);
    }

    public async leaveGameSpectator(user: string, logout = false): Promise<void> {
        const game = this.gameByUser.get(user);
        if (!game || !game.lobby.spectators.has(user))
            throw new UserNotInGameError();
        this.gameByUser.delete(user);
        return await game.leaveSpectator(user, logout);
    }

    public async leaveLobbyPlayer(user: string, logout = false): Promise<void> {
        const lobby = this.lobbyByUser.get(user);
        if (!lobby || !lobby.playersAndVirtualPlayers.has(user))
            throw new UserNotInLobbyError();
        if (lobby.owner == user)
            throw new PermissionError();
        if (lobby.gameMode == 'BR' && user.startsWith('bot_'))
            throw new PermissionError();
        this.lobbyByUser.delete(user);
        return await lobby.leavePlayer(user, logout);
    }

    public async leaveLobbySpectator(user: string, logout = false): Promise<void> {
        const lobby = this.lobbyByUser.get(user);
        if (!lobby || !lobby.spectators.has(user))
            throw new UserNotInLobbyError();
        this.lobbyByUser.delete(user);
        return await lobby.leaveSpectator(user, logout);
    }

    public async joinLobbyPlayer(gameName: string, player: string, avatar: number): Promise<void> {
        const lobby = this.lobbies.find(l => l.gameName == gameName);
        if (!lobby)
            throw new LobbyDoesNotExistError();
        await lobby.joinPlayer(player, avatar);
        this.lobbyByUser.set(player, lobby);
    }

    public async joinLobbySpectator(gameName: string, player: string, avatar: number): Promise<void> {
        const lobby = this.lobbies.find(l => l.gameName == gameName);
        if (!lobby)
            throw new LobbyDoesNotExistError();
        await lobby.joinSpectator(player, avatar);
        this.lobbyByUser.set(player, lobby);
    }

    public async joinGameSpectator(gameName: string, player: string): Promise<void> {
        const game = this.games.find(g => g.lobby.gameName == gameName);
        if (!game)
            throw new GameDoesNotExistError();
        await game.joinSpectator(player);
        this.gameByUser.set(player, game);
    }

    public async removeGameFromLists(gameName: string): Promise<void> {
        const game = this.games.find((game: Game) => game.lobby.gameName == gameName);
        if (!game)
            throw new GameDoesNotExistError();
        this.games = await this.games.reduce(g => {
            return g.lobby.gameName != gameName;
        });
        // eslint-disable-next-line require-await
        await game.lobby.participants.foreach(async p => {
            this.gameByUser.delete(p);
            this.lobbyByUser.delete(p);
        });
    }

    public async deleteLobbyRequest(user: string): Promise<void> {
        const lobby = this.lobbyByUser.get(user);
        if (!lobby)
            throw new LobbyDoesNotExistError();
        else if (lobby.owner != user)
            throw new PermissionError();
        else
            await this.deleteLobby(lobby);
    }

    public async deleteLobby(lobby: Lobby): Promise<void> {
        this.lobbies.remove(lobby);
        // eslint-disable-next-line require-await
        await lobby.participants.foreach(async (p: string) => {
            this.lobbyByUser.delete(p);
        });
        await this.roomService.deleteRoom('Lobby:' + lobby.gameName, lobby.owner, true, true);
        await new DeleteLobbyToSendEvent(lobby.gameName).emit();
    }

    public async message(ev: GameChatMessageReceivedEvent): Promise<void> {
        const game = this.gameByUser.get(ev.author);
        if (game)
            await game.guess(ev);
        else
            await new ChatMessageReceivedEvent(ev.author, ev.roomName, ev.message, ev.timestamp, ev.avatar).emit();
    }

    public async sendHint(ev: HintGameChatMessageReceivedEvent): Promise<void> {
        const game = this.gameByUser.get(ev.author);
        if (game){
            const hint = game.getHint()
            await new ChatMessageReceivedEvent("bot_HINT", ev.roomName, hint, new Date(), 0).emit();
        } else {
            throw new Error("Client asking for hint w/o being inGame")
        }
    }

    public async initiateVoteKick(ev: KickGameChatMessageReceivedEvent): Promise<void> {
        const game = this.gameByUser.get(ev.author);
        if (game){
            await game.initiateVoteKick(ev.target, ev.roomName, ev.author)
        } else {
            throw new Error("Client asking for kick w/o being inGame")
        }
    }

    public async voteKick(ev: VoteGameChatMessageReceivedEvent): Promise<void> {
        const game = this.gameByUser.get(ev.author);
        if (game){
            await game.voteKick(ev.author, ev.isKick, ev.roomName)
        } else {
            throw new Error("Client voting for kick w/o being inGame")
        }
    }

    public async logout(user: string): Promise<void> {
        await this.leaveGameSpectator(user, true).catch(() => { return });
        await this.leaveGamePlayer(user, true).catch(() => { return });
        await this.leaveLobbySpectator(user, true).catch(() => { return });
        await this.leaveLobbyPlayer(user, true).catch(() => { return });
        await this.deleteLobbyRequest(user).catch(() => { return });
        this.gameByUser.delete(user);
        this.lobbyByUser.delete(user);
    }

    public async startGameRequest(ev: StartGameReceivedEvent): Promise<void> {
        const lobby = this.lobbyByUser.get(ev.username);
        if (!lobby)
            throw new UserNotInLobbyError();
        if (lobby.owner != ev.username)
            throw new PermissionError();
        await this.startGame(lobby);
    }

    public async setPath(ev: SetPathReceivedEvent): Promise<void> {
        const game = this.gameByUser.get(ev.username);
        if (!game)
            throw new UserNotInGameError();
        if (game.currentArtist != ev.username)
            throw new PermissionError();
        const setEv = new SetPathToSendEvent(game.lobby.participants, ev.pathId, ev.color, ev.strokeWidth, ev.path, ev.canvasSize);
        game.events.push(setEv);
        await setEv.emit();
    }

    public async appendToPath(ev: AppendToPathReceivedEvent): Promise<void> {
        const game = this.gameByUser.get(ev.username);
        if (!game)
            throw new UserNotInGameError();
        if (game.currentArtist != ev.username)
            throw new PermissionError();
        const appendEv = new AppendToPathToSendEvent(game.lobby.participants, ev.x, ev.y);
        game.events.push(appendEv);
        await appendEv.emit();
    }

    public async addBot(ev: AddBotReceivedEvent): Promise<void> {
        const lobby = this.lobbyByUser.get(ev.username);
        if (!lobby)
            throw new UserNotInLobbyError();
        if (lobby.owner != ev.username)
            throw new PermissionError();
        if (lobby.gameMode == 'BR')
            throw new PermissionError();
        const virt = new VirtualPlayer(lobby.difficulty)
        this.lobbyByUser.set(virt.personality.name, lobby)
        await lobby.joinVirtualPlayer(virt);
    }

    public async kickPlayer(ev: KickPlayerReceivedEvent): Promise<void> {
        const lobby = this.lobbyByUser.get(ev.author);
        if (!lobby || !lobby.playersAndVirtualPlayers.has(ev.target))
            throw new UserNotInLobbyError();
        if (lobby.owner != ev.author)
            throw new PermissionError();
        await this.leaveLobbyPlayer(ev.target);
    }
}
