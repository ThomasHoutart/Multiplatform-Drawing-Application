import { SelectionChange, SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Lobby } from 'src/app/models/interface/lobby';
import { GameService } from 'src/app/services/game/game.service';
import { LobbyService } from 'src/app/services/lobby/lobby.service';
import { UserService } from 'src/app/services/user/user.service';
import { BATTLE_ROYALE, FREE_FOR_ALL } from '../constant';
import { LobbyCreationComponent } from '../lobby-creation/lobby-creation.component';

@Component({
    selector: 'app-lobby-list',
    templateUrl: './lobby-list.component.html',
    styleUrls: ['./lobby-list.component.css']
})
export class LobbyListComponent implements OnInit, OnDestroy {

  @Output()
   onJoin: EventEmitter<any> = new EventEmitter<any>();

    public fetchedList: boolean;
    public lobbies: Lobby[];
    public filteredList: Lobby[];
    public displayedColumns: string[];
    public selectedLobby: Lobby;
    public selection = new SelectionModel<Lobby>(false, null);
    public lobbyUpdateSubscription: Subscription;
    public filterList: Subscription;
    public deleteLobby: Subscription;
    public startGame: Subscription;

    constructor(
        public dialog: MatDialog,
        public lobby: LobbyService,
        private user: UserService,
        private game: GameService) {
        this.fetchedList = true;
        this.lobbies = this.lobby.lobbies;
        this.displayedColumns = ['gameName', 'status', 'playerCount'];

    }
    public deleteLobbyListener(): void {
        this.deleteLobby = this.lobby.lobbyDeleteListener().subscribe((lobby) => {
            try {
                if (this.selectedLobby.gameName === lobby.gameName) {
                    this.selectedLobby = {} as any;
                }   
            } catch(e) {return}
        })
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public selectRow(row): void {
        console.log(row);
        if(this.selection.isSelected(row)){
            this.selection.clear();
            this.selectedLobby = {} as any;
        }else {
            this.selection.select(row);
        }
    }


    public canJoinLobbyAsPlayer(): boolean {
        if (this.selectedLobby) {
            if (this.selectedLobby.status !== 'In Progress' && 
            ((this.selectedLobby.playerCount < 4 && this.selectedLobby.gameMode === FREE_FOR_ALL) || 
            (this.selectedLobby.playerCount < 8 && this.selectedLobby.gameMode === BATTLE_ROYALE) ) ) {
                return true
            }
        }
        return false;
    }

    public canJoinLobbyAsSpectator(): boolean {
        return this.selectedLobby && (this.selectedLobby.status === 'In Progress' || this.selectedLobby.status === 'Lobby');
    }

    public filterTheList(game: string, difficulty: string ): void {
        this.filteredList = this.lobbies.filter((element) => {
            return element.gameMode === game && element.difficulty === difficulty
        });
        const clone: Lobby[] = [];
        this.filteredList.forEach(element => clone.push(Object.assign({}, element)));
        this.filteredList = clone;
    }

    public lobbySelectedEventInit(): void {
        this.selection.changed.subscribe((a: SelectionChange<Lobby>) =>
        {
            if (a.added[0])
                this.selectedLobby = a.added[0];
        });
    }

    private openCreateLobbyComponent(): void {
        this.dialog.open(LobbyCreationComponent, {
            data: {},
        });
    }


    public onJoinLobby(isPlayer: boolean): void {
        this.user.status.isSpectator = !isPlayer;
        this.game.gameInfo.gameName = this.selectedLobby.gameName;
        isPlayer ? this.lobby.joinLobbyAsPlayer(this.selectedLobby) : 
            (this.selectedLobby.status === 'Lobby' ? 
                this.lobby.joinLobbyAsSpectator(this.selectedLobby) :
                this.game.joinGameAsSpectator(this.selectedLobby));
    }

    public onCreateLobby(): void {
        this.openCreateLobbyComponent()
    }

    updateListListener(): void {
        this.lobbyUpdateSubscription = this.lobby.getLobbiesUpdate().subscribe(() => {
            const clone: Lobby[] = [];
            this.lobby.lobbies.forEach(element => clone.push(Object.assign({}, element)));
            this.lobbies = clone;
            this.filterTheList(this.lobby.lobbyTypeSelection.gameMode, this.lobby.lobbyTypeSelection.difficulty);
        })
    }

    filterListListener(): void {
        this.filterList = this.lobby.getFilterListUpdate().subscribe(() => {
            this.filterTheList(this.lobby.lobbyTypeSelection.gameMode, this.lobby.lobbyTypeSelection.difficulty);
        })
    }

    startGameListener(): void {
        this.startGame = this.lobby.startGameListerners().subscribe((game: Lobby) => {
            for (const lobby of this.lobbies) {
                if (lobby.gameName === game.gameName) {
                    lobby.status = 'In Progress';
                    if(this.selectedLobby.gameName==lobby.gameName){
                        this.selection.clear();
                        this.selectedLobby = {} as any;
                    }
                    this.filterTheList(lobby.gameMode, lobby.difficulty);
                    return;
                }
            }
        })
    }

    listen(): void {
        this.updateListListener();
        this.lobbySelectedEventInit();
        this.filterListListener();
        this.lobby.sendFilterListUpdate();
        this.deleteLobbyListener();
        this.startGameListener();
    }

    terminate(): void {
        this.lobbyUpdateSubscription.unsubscribe();
        this.filterList.unsubscribe();
        this.deleteLobby.unsubscribe();
        this.startGame.unsubscribe();
    }

    ngOnInit(): void {
        this.listen();
    }

    ngOnDestroy(): void {
        this.terminate();
    }
}
