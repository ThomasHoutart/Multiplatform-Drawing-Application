import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserInGame } from 'src/app/models/interface/game';
import { GameService } from 'src/app/services/game/game.service';
import * as confetti from 'canvas-confetti';

@Component({
    selector: 'app-end-game-dialog',
    templateUrl: './end-game-dialog.component.html',
    styleUrls: ['./end-game-dialog.component.css'],
})
export class EndGameDialogComponent implements AfterViewInit {
  public roundNb: number;
  public inGamePlayerList: UserInGame[];
  public displayedColumns: string[];
  @ViewChild('confetti') confettiCanvas: ElementRef;

  constructor(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    @Inject(MAT_DIALOG_DATA) public data: any,
    public game: GameService
  ) {
      this.inGamePlayerList = data.playerScoreUpdate;
      this.displayedColumns = ['placementPosition', 'icon', 'username', 'score'];
  }
  ngAfterViewInit(): void {
      confetti.create(this.confettiCanvas.nativeElement)({
          particleCount: 100,
          spread: 20
      });
  }
}
