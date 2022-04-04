import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameInfo, Player } from 'src/app/models/interface/game';
import { Lobby, LobbyGameList, LobbyUserList } from 'src/app/models/interface/lobby';
import { GameService } from 'src/app/services/game/game.service';
import { LobbyService } from 'src/app/services/lobby/lobby.service';
import { MenuService } from 'src/app/services/menu/menu.service';
import { UserService } from 'src/app/services/user/user.service';
import { State } from 'src/interface/section/section';

@Component({
    selector: 'app-gamemode',
    templateUrl: './gamemode.component.html',
    styleUrls: ['./gamemode.component.css'],
})
export class GamemodeComponent implements OnInit, OnDestroy {

    public inLobby: boolean
    public inGame: boolean
    public refState = State;
    public state: State;
    public lobbyUpdate: Subscription;
    public lobbyInfo: Subscription;
    public deleteLobby: Subscription;
    public endGame: Subscription;
    public lobbyCreation: Subscription;
    public joinGame: Subscription
    public backToGameCreation: Subscription;
    public gameInfoUpdate: Subscription;

    constructor(private lobby: LobbyService, private game: GameService, private user: UserService, private menu: MenuService) {
        this.state = State.GameCreationView;
    }
    
    public changeState(event: State): void{
        this.state = event;
    }

    public getLobbyList(): void {
        this.lobby.gameListRequest().subscribe((lobbies: LobbyGameList) => {
            this.lobby.generateLobbyList(lobbies);
            this.lobby.sendLobbiesUpdate();
        })
    }

    public getLobbiesUpdate(): void {
        this.lobbyUpdate = this.lobby.lobbyUpdateListeners().subscribe((lobby: Lobby) => {
            this.lobby.updateLobbyCount(lobby);
            this.lobby.sendLobbiesUpdate();
        })
    }

    public getLobbiesInfo(): void {
        this.lobbyInfo = this.lobby.lobbyInfoListerners().subscribe((lobbyUserList: LobbyUserList) => {
            if (this.lobby.isPlayerInLobby(lobbyUserList)) {
                this.lobby.makeUserList(lobbyUserList);
            }
        })
    }

    public deleteLobbyListener(): void {
        this.deleteLobby = this.lobby.lobbyDeleteListener().subscribe((lobby) => {

            this.lobby.removeLobby(lobby);
            this.lobby.sendLobbiesUpdate();
        })
    }

    public endGameListener(): void {
        this.endGame = this.game.endGameListener().subscribe((gameName: string) => {
            const lobby: Lobby = {gameName: gameName};
            this.lobby.removeLobby(lobby);
            this.lobby.sendLobbiesUpdate();
        })
    }

    gameCreationListener(): void {
        this.lobbyCreation = this.lobby.lobbyCreationListeners().subscribe((lobby: Lobby)=> {
            lobby.status = 'Lobby';
            this.lobby.addNewLobby(lobby);
            if (lobby.username === this.user.getUsername()) {
                this.lobby.setUserType();
                this.lobby.setCurrentLobby(lobby);
                this.lobby.inLobby = true;
                this.game.isGame = true;
            }
        })
    }

    joinGameAsSpectatorListener(): void {
        this.joinGame = this.game.joinGameSpectatorListener().subscribe((info: GameInfo) => {
            if (this.user.getUsername() === info.username) {
                this.menu.updateBarMenu(true);
                this.user.status.isSpectator = true;
                this.user.status.isHost = false;
                this.game.isGame = true;
                this.game.softReset();
                this.game.initializePlayerList([]);
                this.state = State.InGameView;
            }
        })
    }

    public backToGameCreationListenter(): void {
        this.backToGameCreation = this.lobby.listenBackToGameCreation().subscribe(() => {
            this.state = State.GameCreationView;
        })
    }

    public getGameInfo(): void {
        this.gameInfoUpdate = this.game.getGameInfo().subscribe((info: Player[]) => {
            this.game.initializeScore(info);
            this.game.sendUserScoreUpdate();
        });
    }
    
    public listen(): void {
        this.getLobbiesUpdate();
        this.getLobbiesInfo();
        this.deleteLobbyListener();
        this.endGameListener();
        this.gameCreationListener();
        this.joinGameAsSpectatorListener();
        this.backToGameCreationListenter();
        this.getGameInfo();
    }

    public terminate(): void {
        this.lobbyInfo.unsubscribe();
        this.lobbyUpdate.unsubscribe();
        this.deleteLobby.unsubscribe();
        this.endGame.unsubscribe();
        this.lobbyCreation.unsubscribe();
        this.joinGame.unsubscribe();
        this.backToGameCreation.unsubscribe();
        this.gameInfoUpdate.unsubscribe();
    }

    public ngOnInit(): void {
        this.listen();
        this.getLobbyList();
    }

    public ngOnDestroy(): void {
        this.terminate();
    }
}
