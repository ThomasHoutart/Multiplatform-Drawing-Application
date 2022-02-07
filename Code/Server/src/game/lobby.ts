import { BadDifficultyError, BadGameModeError } from "../errors/game";
import { PermissionError } from "../errors/generic";
import { LobbyFullError, UserAlreadyInLobbyError } from "../errors/lobby";
import { JoinLobbyPlayerToSendEvent,  JoinLobbySpectatorToSendEvent,  LeaveLobbyPlayerToSendEvent, LeaveLobbySpectatorToSendEvent, LobbyInfoToSendEvent, UpdateLobbyToSendEvent } from "../events/gameEvents";
import { List } from "../List";
import { RoomService } from "../services/Core/RoomService";
import { VirtualPlayer } from "../virtualPlayer/virtualPlayer";
import { Difficulty, Easy, Hard, Normal } from "./Difficulty";

export class Lobby {
    public players: List<string>;
    public spectators: List<string>;
    public participants: List<string>;
    public roomService: RoomService;
    public virtualPlayers: List<VirtualPlayer>;
    public playersAndVirtualPlayers: List<string>;
    public difficulty: Difficulty;

    constructor(public gameName: string, public gameMode: string, difficulty: string, public owner: string) {
        switch (difficulty) {
            case 'Easy':
                this.difficulty = new Easy();
                break;
            case 'Normal':
                this.difficulty = new Normal();
                break;
            case 'Hard':
                this.difficulty = new Hard();
                break;
            default:
                throw new BadDifficultyError();
        }
        if (!new List(['FFA', 'BR']).has(gameMode))
            throw new BadGameModeError();
        this.players = new List();
        this.spectators = new List();
        this.participants = new List();
        this.virtualPlayers = new List();
        this.playersAndVirtualPlayers = new List();
        this.roomService = RoomService.getInstance();
    }

    public async joinSpectator(user: string, avatar: number): Promise<void> {
        if (this.participants.has(user))
            throw new UserAlreadyInLobbyError();
        this.spectators.push(user);
        this.participants.push(user);
        await this.roomService.join(user, 'Lobby:' + this.gameName, true);
        await new JoinLobbySpectatorToSendEvent(this.participants, user, this.gameName, avatar).emit();
        await new LobbyInfoToSendEvent(user, this.playersAndVirtualPlayers, this.spectators).emit();
    }

    public async joinPlayer(user: string, avatar: number, owner = false): Promise<void> {
        if (user.startsWith('bot_') && this.gameMode == 'BR')
            throw new PermissionError();
        if (this.participants.has(user))
            throw new UserAlreadyInLobbyError();
        if (this.playersAndVirtualPlayers.length() == 4 && this.gameMode == 'FFA' || this.players.length() == 8 && this.gameMode == 'BR')
            throw new LobbyFullError();
        this.players.push(user);
        this.participants.push(user);
        this.playersAndVirtualPlayers.push(user);
        if (!owner)
            await this.roomService.join(user, 'Lobby:' + this.gameName, true);
        await new JoinLobbyPlayerToSendEvent(this.participants, user, this.gameName, avatar).emit();
        if (this.gameMode == 'FFA')
            await new UpdateLobbyToSendEvent(this.gameName, this.playersAndVirtualPlayers.length()).emit();
        else
            await new UpdateLobbyToSendEvent(this.gameName, this.players.length()).emit();
        await new LobbyInfoToSendEvent(user, this.playersAndVirtualPlayers, this.spectators).emit();
    }

    public async leavePlayer(player: string, logout = false): Promise<void> {
        if (player == this.owner)
            throw new Error('Owner cant leave lobby')
        const receivers = new List(this.participants);
        if (logout)
            receivers.remove(player);
        this.players.remove(player);
        this.participants.remove(player);
        this.playersAndVirtualPlayers.remove(player);
        if (!player.startsWith('bot_')) {
            if (!logout)
                await this.roomService.leave(player, 'Lobby:' + this.gameName, true, logout);
            else
                await this.roomService.roomController.removeUser('Lobby:' + this.gameName, player);
        } else {
            const vp = this.virtualPlayers.find(vp => vp.personality.name == player);
            if (!vp) throw new Error(`VP ${player} not found in lobby`)
            this.virtualPlayers.remove(vp);
        }
        await new LeaveLobbyPlayerToSendEvent(receivers, player).emit();
        if (this.gameMode == 'FFA')
            await new UpdateLobbyToSendEvent(this.gameName, this.playersAndVirtualPlayers.length()).emit();
        else
            await new UpdateLobbyToSendEvent(this.gameName, this.players.length()).emit();
    }

    public async leaveSpectator(player: string, logout = false): Promise<void> {
        const receivers = new List(this.participants);
        if (logout)
            receivers.remove(player);
        await new LeaveLobbySpectatorToSendEvent(receivers, player).emit();
        this.spectators.remove(player);
        this.participants.remove(player);
        if (!logout)
            await this.roomService.leave(player, 'Lobby:' + this.gameName, true, logout);
        else
            await this.roomService.roomController.removeUser('Lobby:' + this.gameName, player);
    }

    public async joinVirtualPlayer(vp: VirtualPlayer) {
        if (this.playersAndVirtualPlayers.length() == 4)
            throw new LobbyFullError();
        this.virtualPlayers.push(vp);
        this.playersAndVirtualPlayers.push(vp.personality.name);
        await new JoinLobbyPlayerToSendEvent(this.participants, vp.personality.name, this.gameName, vp.personality.avatar).emit();
        if (this.gameMode == 'FFA')
            await new UpdateLobbyToSendEvent(this.gameName, this.playersAndVirtualPlayers.length()).emit();
        else
            await new UpdateLobbyToSendEvent(this.gameName, this.players.length()).emit();
    }
}
