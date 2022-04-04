import { Component, OnDestroy, OnInit } from '@angular/core';
import { RoomService } from 'src/app/services/room/room.service';
import { RoutingService } from 'src/app/services/routing/routing.service';
import { LogoutSocketHandlerService } from 'src/app/services/websocket/logoutSocketHandler/logout-socket-handler.service';
import { INTEGRATED } from './constant';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { LogoutComponent } from '../warning/logout/logout.component';
import { GameService } from 'src/app/services/game/game.service';
import { LobbyService } from 'src/app/services/lobby/lobby.service';
import { LeaveLobbyComponent } from '../warning/leave-lobby/leave-lobby.component';
import { LeaveGameComponent } from '../warning/leave-game/leave-game.component';
import { TutorielComponent } from '../tutoriel/tutoriel.component';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { WordImagePairHandler } from 'src/app/services/word-image-pair-handler/word-image-pair-handler.service';
import { LeaveWIPComponent } from '../warning/leave-wip/leave-wip.component';
import { MenuService } from 'src/app/services/menu/menu.service';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css']
})

export class MenuComponent implements OnInit, OnDestroy {

  public chatIntegrated = true;
  public chatState = INTEGRATED;
  public windowSubscription: Subscription;
  public barUpdate: Subscription;
  public ExitButton: boolean;
  public page: number;

  constructor(
    private routing: RoutingService,
    private socket: LogoutSocketHandlerService,
    public dialog: MatDialog,
    private room: RoomService,
    private lobby: LobbyService,
    public game: GameService,
    public profile: ProfileService,
    public wip: WordImagePairHandler,
    public menu: MenuService) {
      this.ExitButton = false;
      this.page = 0;
  }
    

  logout(): void {
      const dialogRef = this.dialog.open(LogoutComponent);
      dialogRef.afterClosed().subscribe((isConfirmed) => {
          if (isConfirmed) {
              this.socket.logout();
    	    this.routing.moveToLogin();
    	    this.room.resetRoom();
          }
      });
  }

  onLeave(): void {
      const dialogRef = this.dialog.open(this.wip.isCreatingNewPair ? LeaveWIPComponent : (this.lobby.inLobby ? LeaveLobbyComponent : LeaveGameComponent));
      dialogRef.afterClosed().subscribe((isConfirmed) => {
          if (isConfirmed) {
              this.lobby.kickFromServer = false;
              if (!this.wip.isCreatingNewPair) {
                  this.lobby.inLobby ? this.lobby.leaveLobby() : this.game.leaveGame();
              } else
                  this.wip.initialWIPState();
          }
      });
  }

  onTutorial(): void {
      this.dialog.open(TutorielComponent, {
          hasBackdrop: true,
          disableClose: true,
      });
  }

  onProfile(): void {
      this.profile.getProfileInfo().subscribe((info: any) => {
          this.profile.setProfileInfo(info);
          this.page = 1;
      })
  }

  onToolBarUpdate(): void {
      this.barUpdate = this.menu.getBarMenuUpdate().subscribe((isExitButton: boolean) => {
          this.ExitButton = isExitButton;
      })
  }

  ngOnInit(): void {
      this.onToolBarUpdate();
  }

  ngOnDestroy(): void {
      this.barUpdate.unsubscribe();
  }
}
