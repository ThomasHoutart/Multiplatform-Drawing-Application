import { Component, OnInit } from '@angular/core';
import { Leaderboard } from 'src/app/models/interface/leaderboard';
import { AvatarService } from 'src/app/services/avatar/avatar.service';
import { LeaderboardService } from 'src/app/services/leaderboard/leaderboard.service';
import { UserService } from 'src/app/services/user/user.service';
import { FREE_FOR_ALL, NORMAL } from '../gamemode/game-creation/constant';
import { WEEKLY } from './constant';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.css'],
})
export class LeaderboardComponent implements OnInit {
    
    rankingType: any;
    rankingMode: any;
    rankingDifficulty: any;
    leaderboardList: any[][][]
    filteredList: Leaderboard[];
    displayedColumns: string[];

    constructor(private user: UserService, private leaderboard: LeaderboardService, private avatar: AvatarService) {
        this.rankingType = WEEKLY;
        this.rankingMode = FREE_FOR_ALL;
        this.rankingDifficulty = NORMAL
        this.displayedColumns = ['rank', 'picture', 'player', 'score'];
        this.leaderboardList = [];
        this.filteredList = [];
    }

    public filterTheList(): void {
        this.filteredList = this.leaderboardList[this.rankingMode][this.rankingDifficulty][this.rankingType];
        this.sortRanking();
    }

    private sortRanking(): void {
        this.filteredList = this.filteredList.sort((p1, p2) => {
            return (p2.nWins - p1.nWins);
        });
        this.updateRanking();
    }

    private updateRanking(): void {
        let rank = 1;
        let score = -1;
        for (const player of this.filteredList) {
            if (score === -1) {
                score = player.nWins;
                player.rank = rank;
            } 
            if (player.nWins !== score) {
                rank += 1;
                score = player.nWins;
            }
            player.rank = rank;
        }
    }

    public getUsername(): string {
        return this.user.getUsername();
    }

    public getUserPicture(index: number): string {
        return this.avatar.getAvatarUrlString(index);
    }

    public onRanking(ranking: string): void {
        this.rankingType = ranking
        this.filterTheList();
        
    }

    public onGameMode(mode: string): void {
        this.rankingMode = mode;
        this.filterTheList();
    }

    public onDifficulty(difficulty: string): void {
        this.rankingDifficulty = difficulty;
        this.filterTheList();
    }

    public getLeaderboard(): void {
        this.leaderboard.getLeaderboard().subscribe((list: any) => {
            this.leaderboardList = list;
            this.filterTheList();
        })
    }

    public ngOnInit(): void {
        this.getLeaderboard();
    }
}
