import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DEFAULT_PICTURE_1 } from 'src/app/models/constant/pictures/constant';
import { UserInGame } from 'src/app/models/interface/game';
import { AvatarService } from 'src/app/services/avatar/avatar.service';
import { GameService } from 'src/app/services/game/game.service';

@Component({
    selector: 'app-game-scoreboard',
    templateUrl: './game-scoreboard.component.html',
    styleUrls: ['./game-scoreboard.component.css']
})
export class GameScoreboardComponent implements OnInit, OnDestroy {
  public inGamePlayerList: UserInGame[];
  public displayedColumns: string[];
  public playerScoreUpdate: Subscription;

  constructor(private game: GameService, public avatar: AvatarService) {
      this.inGamePlayerList = this.game.playersScore;
      this.displayedColumns = ['placementPosition', 'icon','username', 'score'];
  }

  public getUserPicture(): string {
      return DEFAULT_PICTURE_1;
  }

  public getPlayerScoreUpdate(): void {
      this.playerScoreUpdate = this.game.getUserScoreUpdate().subscribe(() => {
          this.inGamePlayerList = this.game.playersScore;
          this.sortByPlacement();
      })
  }

  private sortByPlacement(): void {
      this.placementUpdate();
      this.inGamePlayerList = this.inGamePlayerList.sort((p1, p2) => {
          return (p1.placementPosition - p2.placementPosition);
      });
      this.updatePLayerList();
  }

  public updatePLayerList(): void {
      const clone: UserInGame[] = [];
      this.inGamePlayerList.forEach(element => clone.push(Object.assign({}, element)));
      this.inGamePlayerList = clone;
  }

  private placementUpdate(): void {
      this.updatePLayerList();
      for (let i = 0; i < this.inGamePlayerList.length; i++) {
          let rank = 1;
          for (let j = 0; j < this.inGamePlayerList.length; j++) {
              if (this.inGamePlayerList[j].score > this.inGamePlayerList[i].score) rank++;
          }
          this.inGamePlayerList[i].placementPosition = rank;
      }
  }

  public ngOnInit(): void {
      this.sortByPlacement();
      this.getPlayerScoreUpdate();
  }

  public ngOnDestroy(): void {
      this.playerScoreUpdate.unsubscribe();
  }
}
