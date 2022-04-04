import { Component } from '@angular/core';
import { UserInGame } from 'src/app/models/interface/game';
import { AvatarService } from 'src/app/services/avatar/avatar.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { GameScores, GameStats } from 'src/interface/profileInfo';
import { Month } from '../connection-stats/constant';

@Component({
    selector: 'app-match-history',
    templateUrl: './match-history.component.html',
    styleUrls: ['./match-history.component.css']
})
export class MatchHistoryComponent {

    public inGamePlayerList: UserInGame[];
    public displayedColumns: string[];
    public currentlyOpenedItemIndex;
    public gameStats: GameStats[];
    public gameScores: GameScores[];
    public statsInOrder: GameStats[];

    constructor(public avatar: AvatarService, public profil: ProfileService) {
        this.displayedColumns = ['rank', 'icon', 'username', 'score'];
        this.gameStats = [];
        this.statsInOrder = [];
        this.currentlyOpenedItemIndex = -1;
        this.getGameHistoryInfos();
    }

    public getGameHistoryInfos(): void {
        this.initializeGameHistory();
        this.sortGamesStats();
        this.sortGamesPlacement();
    }

    initializeGameHistory(): void {
        const infoBr: any = this.profil.info.BR as any;
        const infoFFA: any = this.profil.info.FFA as any;
        this.historyExtraSteps(infoBr.Easy);
        this.historyExtraSteps(infoBr.Normal);
        this.historyExtraSteps(infoBr.Hard);
        this.historyExtraSteps(infoFFA.Easy);
        this.historyExtraSteps(infoFFA.Normal);
        this.historyExtraSteps(infoFFA.Hard);
    }

    historyExtraSteps(dif: any[][]): void {
        for (const element of dif) {
            this.historyLastStep(element);
        }
        this.statsInOrder = this.gameStats.reverse();
    }

    public convertString(time: string): string {
        const newDate = new Date(time)

        return Month[newDate.getMonth()] + ' ' + newDate.getDate().toString() + ' ' + newDate.getFullYear().toString();
    }

    public convertStringTwo(time: number, milli?: number): string {
        const newDate = new Date(time)
        if (milli) {
            newDate.setMilliseconds(milli)
        }

        return newDate.toTimeString().substr(0, 8);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    historyLastStep(gameInfo: any): void {
        this.gameStats.push({
            gameDifficulty: gameInfo.difficulty,
            gameMode: gameInfo.gameType,
            name: gameInfo.name,
            gameScores: gameInfo.score,
            date: this.convertString(gameInfo.timestamp),
            timestamp: gameInfo.timestamp,
            startTime: this.convertStringTwo(gameInfo.timestamp),
            endTime: this.convertStringTwo(gameInfo.timestamp, gameInfo.totaltime)
        } as GameStats)
    }

    private sortGamesStats(): void {
        this.gameStats = this.gameStats.sort((timeA, timeB) => {
            return (new Date(timeB.timestamp).getTime() - new Date(timeA.timestamp).getTime());
        })
    }

    private sortGamesPlacement(): void {
        for (let i = 0; i < this.gameStats.length; i++) {
            this.placementUpdate(i);
            this.gameStats[i].gameScores = this.gameStats[i].gameScores.sort((p1, p2) => {
                return (p1.rank - p2.rank);
            });
        }
    }

    private placementUpdate(gameIndex: number): void {
        for (let i = 0; i < this.gameStats[gameIndex].gameScores.length; i++) {
            let ranking = 1;
            for (let j = 0; j < this.gameStats[gameIndex].gameScores.length; j++) {
                if (this.gameStats[gameIndex].gameScores[j].score > this.gameStats[gameIndex].gameScores[i].score) ranking++;
            }
            this.gameStats[gameIndex].gameScores[i].rank = ranking;
        }
    }

    setOpened(itemIndex: number): void {
        this.currentlyOpenedItemIndex = itemIndex;
    }

    setClosed(itemIndex: number): void {
        if (this.currentlyOpenedItemIndex === itemIndex) {
            this.currentlyOpenedItemIndex = -1;
        }
    }
}
