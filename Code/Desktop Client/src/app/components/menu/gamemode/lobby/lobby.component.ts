/* eslint-disable max-lines-per-function */
import { SelectionChange, SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Socket } from 'ngx-socket-io';
import { Subscription } from 'rxjs';
import { LeaveLobbyComponent } from 'src/app/components/warning/leave-lobby/leave-lobby.component';
import { DEFAULT_PICTURE_1 } from 'src/app/models/constant/pictures/constant';
import { Lobby, UserInLobby } from 'src/app/models/interface/lobby';
import { AvatarService } from 'src/app/services/avatar/avatar.service';
import { GameService } from 'src/app/services/game/game.service';
import { SPECTATOR } from 'src/app/services/lobby/constant';
import { LobbyService } from 'src/app/services/lobby/lobby.service';
import { MenuService } from 'src/app/services/menu/menu.service';
import { RoomService } from 'src/app/services/room/room.service';
import { UserService } from 'src/app/services/user/user.service';
import { State } from 'src/interface/section/section';
import { LOBBY_INFOS_MOCK, PLAYER_LIST_MOCK } from './constant';

@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
    styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy {

    @Output()
    onBack: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    onStart: EventEmitter<any> = new EventEmitter<any>();

    public lobbyInfos: Lobby;
    public playersList: UserInLobby[];
    public displayedColumns: string[];
    public leaveLobby: Subscription;
    public deleteLobby: Subscription;
    public lobbyInfo: Subscription;
    public lobbyJoin: Subscription;
    public userSelected: UserInLobby;
    public selection = new SelectionModel<UserInLobby>(false, null);
    public startGame: Subscription;

    constructor(
        private menu: MenuService,
        public dialog: MatDialog,
        private lobby: LobbyService,
        public user: UserService,
        private game: GameService,
        public avatar: AvatarService,
        public socket: Socket,
        public room: RoomService) {
        this.displayedColumns = ['icon','username','role'];
        this.playersList = PLAYER_LIST_MOCK;
        this.lobbyInfos = LOBBY_INFOS_MOCK;

    }

    public playerSelectedListener(): void {
        this.selection.changed.subscribe((a: SelectionChange<UserInLobby>) =>
        {
            if (a.added[0])
            {
                this.userSelected = a.added[0];
            }
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public selectRow(row): void {
        if(this.user.status.isHost){ 
            if(this.selection.isSelected(row)){
                this.selection.clear();
                this.userSelected = null;
            }else if (!row.host){
                this.selection.select(row);
            }
        }
    }

    canKickPlayer(): boolean {
        if (this.userSelected)
            return this.user.getUsername() !== this.userSelected.username 
            && !this.userSelected.username.startsWith('bot_TieBreaker')
            && this.userSelected.role !== 'Spectator';
        return false;
    }

    public kickPlayer(): void {
        if (this.user.getUsername() !== this.userSelected.username 
        && !this.userSelected.username.startsWith('bot_TieBreaker')) {
            this.lobby.kickPlayer(this.userSelected.username);
            this.userSelected = null;
        }
    }
    
    public canYouStartLobby(): boolean {
        let playerCount = 0;
        for (const player of this.playersList) {
            if (player.role !== SPECTATOR && player.role !== 'Bot') {
                playerCount += 1;
            }
        }
        return playerCount > 1 && this.user.status.isHost;
    }

    public howManyPlayer(): number {
        let playerCount = 0;
        for (const player of this.playersList) {
            if (player.role !== SPECTATOR) {
                playerCount += 1;
            }
        }

        return playerCount;
    }

    public isHost(): boolean {
        return this.user.getUsername() == this.lobbyInfos.username;
    }

    public isGameFFA(): boolean {
        return this.lobbyInfos.gameMode === 'FFA';
    }

    public getUserPicture(): string {
        return DEFAULT_PICTURE_1;
    }

    public canAddBot(): boolean {
        return this.playersList.length < 4;
    }

    public addBot(): void {
        if (this.playersList.length < 4) {
            this.lobby.addBot();
        }
    }

    public startNewGame(): void {
        this.lobby.startGame();
    }

    public back(): void {
        const dialogRef = this.dialog.open(LeaveLobbyComponent);
        dialogRef.afterClosed().subscribe((isConfirmed) => {
            if (isConfirmed) {
                this.lobby.leaveLobby();
                this.userSelected = null;
            }
        });
    }

    public leaveLobbyListener(): void {
        this.leaveLobby = this.lobby.lobbyLeaveListeners().subscribe((lobby) => {
            if (!this.user.status.isSpectator) {
                this.lobby.decrementLobbyCount(this.lobby.currentLobby);
            }
            this.lobby.sendLobbiesUpdate();
            this.lobby.removeUserInList(lobby.username);
            this.updatePLayerList();
            if (lobby.username === this.user.getUsername()) {
                this.menu.updateBarMenu(false);
                this.lobby.inLobby = false;
                this.lobby.resetUserStatus();
                this.onBack.emit(State.GameCreationView);
                this.game.isGame = false;
            }
        })
    }

    public deleteLobbyListener(): void {
        this.deleteLobby = this.lobby.lobbyDeleteListener().subscribe((lobby) => {
            if (this.lobby.currentLobby.gameName === lobby.gameName) {
                this.menu.updateBarMenu(false);
                this.lobby.kickFromServer = false;
                this.lobby.inLobby = false;
                this.lobby.resetUserStatus();
                this.game.isGame = false;
                this.onBack.emit(State.GameCreationView);
            }
        })
    }

    public lobbyInfoListener(): void {
        this.lobbyInfo = this.lobby.lobbyInfoListerners().subscribe((lobbyUserList: any) => {
            if (this.lobby.isPlayerInLobby(lobbyUserList)) {
                this.updatePLayerList();
            }
        })
    }

    joinLobbyListener(): void {
        this.lobbyJoin = this.lobby.lobbyJoinListeners().subscribe((lobby: Lobby)=> {
            if (lobby.gameName === this.lobby.currentLobby.gameName) {
                this.lobby.addUserInList(lobby, lobby.avatar);
                this.updatePLayerList();
            }
        })
    }

    startGameListener(): void {
        this.startGame = this.lobby.startGameListerners().subscribe((lobby: Lobby) => {
            this.lobby.kickFromServer = false;
            this.game.gameInfo.gameName = lobby.gameName;
            this.game.gameInfo.gameMode = this.lobby.currentLobby.gameMode;
            this.game.gameInfo.difficulty = this.lobby.currentLobby.difficulty;
            if (lobby.gameName === this.lobby.currentLobby.gameName) {
                this.game.softReset();
                this.game.initializePlayerList(this.playersList);
                this.lobby.setLobbyStatus(lobby);
                this.lobby.inLobby = false;
                this.onStart.emit(State.InGameView);
            }
        })
    }

    updatePLayerList(): void {
        const clone: UserInLobby[] = [];
        this.lobby.currentLobbyUserList.forEach(element => clone.push(Object.assign({}, element)));
        this.playersList = clone;
        this.userSelected = null;
    }

    handleKickFromServer(): void {
        if (this.lobby.kickFromServer) {
            this.room.addMessage({
                chatMessage: {
                    content: 'You have been kicked from the lobby. You are back to the General chat.',
                    author: 'system',
                    roomName: 'General',
                    timestamp: '',
                    avatar: 0,
                },
                type: 2,
            })
        }
    }

    listen(): void {
        this.leaveLobbyListener();
        this.deleteLobbyListener();
        this.lobbyInfoListener();
        this.joinLobbyListener();
        this.startGameListener();
        this.playerSelectedListener();
    }

    terminate(): void {
        this.leaveLobby.unsubscribe()
        this.deleteLobby.unsubscribe();
        this.lobbyInfo.unsubscribe();
        this.lobbyJoin.unsubscribe();
        this.startGame.unsubscribe();
        this.handleKickFromServer();
    }


    ngOnInit(): void {
        this.lobbyInfos = this.lobby.currentLobby;
        this.updatePLayerList();
        this.listen();
        this.lobby.kickFromServer = true;
    }

    ngOnDestroy(): void {
        this.terminate();
    }
}
