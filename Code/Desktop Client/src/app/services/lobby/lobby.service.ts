import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FREE_FOR_ALL, NORMAL } from 'src/app/components/menu/gamemode/game-creation/constant';
import { Lobby, LobbyGameList, LobbyUserList, UserInLobby } from 'src/app/models/interface/lobby';
import { UserService } from '../user/user.service';
import { LobbySocketHandlerService } from '../websocket/lobbySocketHandler/lobby-socket-handler.service';
import { GAME_LIST_REQUEST, HOST, PLAYER, SPECTATOR } from './constant';

@Injectable({
    providedIn: 'root'
})
export class LobbyService {
    lobbyTypeSelection: Lobby;
    lobbies: Lobby[];
    currentLobby: Lobby;
    currentLobbyUserList: UserInLobby[];
    updateLobbiesList: Subject<void>;
    lobbyCreation: Subject<string>;
    filterList: Subject<void>;
    backToGameCreation: Subject<void>;
    inLobby: boolean;
    kickFromServer: boolean;

    constructor(
        private socket: LobbySocketHandlerService,
        private http: HttpClient,
        private user: UserService) {
        this.lobbies = [];
        this.currentLobbyUserList = [];
        this.inLobby = false;
        this.updateLobbiesList = new Subject<void>();
        this.lobbyCreation = new Subject<string>();
        this.filterList = new Subject<void>();
        this.backToGameCreation = new Subject<void>();
        this.lobbyTypeSelection = { gameName: '', gameMode: FREE_FOR_ALL, difficulty: NORMAL }
        this.kickFromServer = true;
    }

    listenBackToGameCreation(): Observable<void> {
        return this.backToGameCreation.asObservable();
    }

    sendBackToGameCreation(): void {
        this.backToGameCreation.next();
    }

    generateLobbyList(lobbyInfo: LobbyGameList): void {
        this.lobbies = [];
        for (const lobby of lobbyInfo.lobbies) {
            lobby.status = 'Lobby';
            this.lobbies.push(lobby);
        } for (const lobby of lobbyInfo.games) {
            lobby.status = 'In Progress';
            this.lobbies.push(lobby);
        }
    }

    setLobbyStatus(lobby: Lobby, status = 'In Progress'): void {
        const lobbyIndex: number = this.getLobbyIndex(lobby.gameName);
        if (lobbyIndex !== -1)
            this.lobbies[lobbyIndex].status = status
    }

    getFilterListUpdate(): Observable<void> {
        return this.filterList.asObservable();
    }

    sendFilterListUpdate(): void {
        this.filterList.next();
    }

    getLobbiesUpdate(): Observable<void> {
        return this.updateLobbiesList.asObservable();
    }

    getInitiationLobbyCreation(): Observable<string> {
        return this.lobbyCreation.asObservable();
    }

    initiateLobbyCreation(gameName: string): void {
        this.lobbyCreation.next(gameName);
    }

    sendLobbiesUpdate(): void {
        this.updateLobbiesList.next();
    }

    gameListRequest(): Observable<any> {
        return this.http.get(GAME_LIST_REQUEST);
    }

    startGame(): void {
        this.socket.startGame();
    }

    addBot(): void {
        this.socket.addBot();
    }

    isPlayerInLobby(lobbyList: LobbyUserList): boolean {
        return this.listVerification(lobbyList.players) || this.listVerification(lobbyList.spectators);
    }

    private listVerification(list: UserInLobby[]): boolean {
        for (const user of list)
            if (user.username === this.user.getUsername())
                return true;
        return false
    }


    setUserType(isHost = true): void {
        this.user.status.isHost = isHost;
    }

    getLobbyIndex(lobbyName: string): number {
        for (let i = 0; i < this.lobbies.length; i++)
            if (lobbyName == this.lobbies[i].gameName)
                return i;
        return -1;
    }

    makeLobbyElement(gameName: string, gameMode: string, difficulty: string, isSpectator = false): Lobby {
        return {
            gameName: gameName,
            gameMode: gameMode,
            difficulty: difficulty,
            isSpectator: isSpectator,
        } as Lobby;
    }

    addNewLobby(lobby: Lobby): void {
        const lobbyIndex: number = this.getLobbyIndex(lobby.gameName)
        if (lobbyIndex === -1)
            this.lobbies.push(lobby);
    }

    updateLobbyCount(lobby: Lobby): void {
        const lobbyIndex: number = this.getLobbyIndex(lobby.gameName)
        if (lobbyIndex !== -1)
            this.lobbies[lobbyIndex].playerCount = lobby.playerCount;
    }

    decrementLobbyCount(lobby: Lobby): void {
        const lobbyIndex: number = this.getLobbyIndex(lobby.gameName)
        if (lobbyIndex !== -1)
            this.lobbies[lobbyIndex].playerCount = this.lobbies[lobbyIndex].playerCount - 1;
    }

    removeLobby(theLobby: Lobby): void {
        this.lobbies = this.lobbies.filter(lobby => {
            return lobby.gameName !== theLobby.gameName;
        });
    }

    setCurrentLobby(lobby: Lobby): void {
        const lobbyIndex: number = this.getLobbyIndex(lobby.gameName)
        if (lobbyIndex !== -1)
            this.currentLobby = this.lobbies[lobbyIndex];
    }

    makeUserList(users: LobbyUserList): void {
        this.currentLobbyUserList = [];
        for (const player of users.players)
            this.currentLobbyUserList.push(this.addUser(player.username, false, player.avatar));
        for (const spectators of users.spectators)
            this.currentLobbyUserList.push(this.addUser(spectators.username, true, spectators.avatar));
        this.currentLobbyUserList[0].role = HOST;
        this.currentLobbyUserList[0].host = true;
    }

    addUser(user: string, isSpectator: boolean, avatar: number): UserInLobby {
        return {
            username: user,
            logo: '1',
            role: user.startsWith('bot_') ? 'Bot' : (isSpectator ? SPECTATOR : PLAYER),
            host: false,
            avatar: avatar,
        } as UserInLobby;
    }

    createLobby(lobby: Lobby): void {
        this.socket.sendLobbyCreation(lobby);
    }

    kickPlayer(username: string): void {
        this.socket.kickPlayer(username);
    }

    joinLobbyAsPlayer(lobby: Lobby): void {
        this.socket.joinLobbyAsPlayer(lobby);
    }

    joinLobbyAsSpectator(lobby: Lobby): void {
        this.socket.joinLobbyAsSpectator(lobby);
    }

    resetUserStatus(): void {
        this.user.status.isHost = false;
        this.user.status.isSpectator = false;
    }

    leaveLobby(): void {
        // this.sendBackToGameCreation();
        if (this.user.status.isHost) {
            this.socket.deleteLobby();
        } else {
            this.user.status.isSpectator ?
                this.socket.leaveLobbyAsSpectator() :
                this.socket.leaveLobbyAsPlayer();
        }
    }

    addUserInList(lobby: Lobby, avatar: number): void {
        this.currentLobbyUserList.push(this.addUser(lobby.username, lobby.isSpectator, avatar));
    }

    removeUserInList(username: string): void {
        this.currentLobbyUserList = this.currentLobbyUserList.filter(user => {
            return user.username !== username
        });
    }

    startGameListerners(): Observable<Lobby> {
        return this.socket.getStartGame();
    }

    lobbyUpdateListeners(): Observable<Lobby> {
        return this.socket.getLobbyUpdate();
    }

    lobbyInfoListerners(): Observable<LobbyUserList> {
        return this.socket.getLobbyInfo();
    }

    lobbyCreationListeners(): Observable<Lobby> {
        return this.socket.getCreateUpdate();
    }

    lobbyJoinListeners(): Observable<Lobby> {
        return this.socket.getJoinUpdate();
    }

    lobbyLeaveListeners(): Observable<Lobby> {
        return this.socket.getLeaveUpdate();
    }

    lobbyDeleteListener(): Observable<Lobby> {
        return this.socket.getDeleteUpdate();
    }

    lobbyErrorListeners(): Observable<Lobby> {
        return this.socket.getErrorUpdate();
    }
}
