import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Lobby, LobbyGameList } from 'src/app/models/interface/lobby';
import { GameService } from 'src/app/services/game/game.service';
import { LobbyService } from 'src/app/services/lobby/lobby.service';
import { MenuService } from 'src/app/services/menu/menu.service';
import { UserService } from 'src/app/services/user/user.service';
import { State } from 'src/interface/section/section';

@Component({
    selector: 'app-game-creation',
    templateUrl: './game-creation.component.html',
    styleUrls: ['./game-creation.component.css']
})
export class GameCreationComponent implements OnInit, OnDestroy {

    @Output()
    onJoin: EventEmitter<any> = new EventEmitter<any>();

    gamemode: string;
    difficulty: string;
    form: FormGroup;
    initateLobbyCreation: Subscription;
    lobbyCreation: Subscription;
    lobbyJoin: Subscription;
    validCreation: boolean;

    constructor(
        private formBuilder: FormBuilder,
        private lobby: LobbyService,
        private user: UserService,
        private game: GameService,
        private menu: MenuService) {
        this.validCreation = false;
        this.gamemode = this.lobby.lobbyTypeSelection.gameMode;
        this.difficulty = this.lobby.lobbyTypeSelection.difficulty;
    }

    onGameModeChange(gameMode: string): void {
        this.gamemode = gameMode;
        this.lobby.lobbyTypeSelection.gameMode = this.gamemode;
        this.lobby.sendFilterListUpdate();
    }

    onDifficultyChange(difficulty: string): void {
        this.difficulty = difficulty;
        this.lobby.lobbyTypeSelection.difficulty = this.difficulty;
        this.lobby.sendFilterListUpdate();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public joinLobby(event: any): void {
        this.onJoin.emit(event);
    }

    initiateGameCreationListener(): void {
        this.initateLobbyCreation = this.lobby.getInitiationLobbyCreation().subscribe((gameName: string) => {
            const newLobby: Lobby = this.lobby.makeLobbyElement(gameName, this.gamemode, this.difficulty);
            this.lobby.createLobby(newLobby);
        });
    }

    gameCreationListener(): void {
        this.lobbyCreation = this.lobby.lobbyCreationListeners().subscribe((lobby: Lobby) => {
            if (lobby.username === this.user.getUsername()) {
                this.menu.updateBarMenu(true);
                this.onJoin.emit(State.LobbyView);
            }
        });
    }

    joinLobbyListener(): void {
        this.lobbyJoin = this.lobby.lobbyJoinListeners().subscribe((lobby: Lobby) => {
            this.lobby.setUserType(false);
            this.lobby.setCurrentLobby(lobby);
            this.lobby.inLobby = true;
            this.game.isGame = true;
            this.menu.updateBarMenu(true);
            this.onJoin.emit(State.LobbyView);
        });
    }

    public getLobbyList(): void {
        this.lobby.gameListRequest().subscribe((lobbies: LobbyGameList) => {
            this.lobby.generateLobbyList(lobbies);
            this.lobby.sendLobbiesUpdate();
        })
    }

    listen(): void {
        this.initiateGameCreationListener();
        this.gameCreationListener();
        this.joinLobbyListener();
    }

    terminate(): void {
        this.initateLobbyCreation.unsubscribe();
        this.lobbyCreation.unsubscribe();
        this.lobbyJoin.unsubscribe();
    }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            lobby: ['', [Validators.required, Validators.maxLength(140)]],
        });
        this.getLobbyList();
        this.game.resetGameSettings();
        this.user.status.isSpectator = false;
        this.listen();
    }

    ngOnDestroy(): void {
        this.terminate();
    }

}
