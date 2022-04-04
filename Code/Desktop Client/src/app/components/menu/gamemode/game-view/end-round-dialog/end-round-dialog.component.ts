import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { UserInGame } from 'src/app/models/interface/game';
import { AvatarService } from 'src/app/services/avatar/avatar.service';
import { GameService } from 'src/app/services/game/game.service';

@Component({
    selector: 'app-end-round-dialog',
    templateUrl: './end-round-dialog.component.html',
    styleUrls: ['./end-round-dialog.component.css']
})
export class EndRoundDialogComponent {

  public roundNb: number;
  public inGamePlayerList: UserInGame[];
  public displayedColumns: string[];
  public title: string;

  constructor(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    @Inject(MAT_DIALOG_DATA) public data: any,
    public game: GameService, public avatar: AvatarService
  ) { 
      this.title = data.title;
      this.inGamePlayerList = data.playerScoreUpdate;
      this.displayedColumns =  ['icon', 'username', 'score', 'scoreVarFromLastRound'];
  }
}
