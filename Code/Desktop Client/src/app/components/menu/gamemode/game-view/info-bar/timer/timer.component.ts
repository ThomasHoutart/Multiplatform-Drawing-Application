import { ViewChild } from '@angular/core';
import { Component, ElementRef, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameService } from 'src/app/services/game/game.service';
import { SoundsService } from 'src/app/services/sounds/sounds.service';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.css'],
})
export class TimerComponent implements OnInit {
  @ViewChild('countdown-number') countdownNumberE: ElementRef;
  @ViewChild('circle') circle: ElementRef;
  public countdown = 45;
  public timer: any;
  public timeLeft: number;
  public gameInfo: Subscription;
  public startRound: any;
  public endRound: any;
  public animeState: any;
  public neg: any;
  public class = 'circle';
  constructor(public game: GameService, private sounds: SoundsService) {
      this.animeState = 'paused';
  }

  ngOnInit(): void {
      this.startRoundListener();
      this.endRoundListener();
      this.updateGameInfoListener();
      this.setCountdownTimerMax();
  }

  public setCountdownTimerMax(): void {
      switch (this.game.gameInfo.difficulty) {
      case 'Hard':
          this.countdown = 32; break;
      case 'Normal':
          this.countdown = 47; break;
      case 'Easy':
          this.countdown = 62; break;
      }
  }

  public startRoundListener(): void {
      this.startRound = this.game.startRoundListener().subscribe(async () => await this.timerStart());
  }

  public endRoundListener(): void {
      this.endRound = this.game.endRoundListener().subscribe(() => this.animeState = "paused");
  }

  public async timerStart(): Promise<void> {
      this.animeState = 'running';
      this.class = 'transparent';
      this.setCountdownTimerMax();
      await delay(50);
      this.class = 'circle';
  }

  private updateGameInfoListener(): void {
      this.gameInfo = this.game.getGameInfoUpdate().subscribe(() => {
          this.timeLeft = this.game.gameInfo.timeLeft;
          if (this.timeLeft == 5) {
              this.sounds.playTimeIsRunningOut();
          }
      });
  }
}

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
