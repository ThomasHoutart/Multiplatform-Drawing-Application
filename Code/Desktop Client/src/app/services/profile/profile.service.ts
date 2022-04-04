import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SERVER_LINK } from 'src/app/models/constant/drawing/constant';
import { GameStats, ProfileInfo } from 'src/app/models/interface/profile-info';
import { UserService } from '../user/user.service';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {

    info: ProfileInfo = {
        BR: [],
        FFA: [],
        connections: [],
        nLosses: 0,
        nWins: 0,
        totalGameTimeMinutes: 0,
        totalTimeMinutes: 0,
    }
    matchHistory: any[][][] = [];
    gameStat: GameStats = {
        gamePlayed: 0,
        winrate: 0,
        totalGameTime: 0,
        totalTime: 0,
    }


    constructor(private user: UserService, private http: HttpClient) { }

    getProfileInfo(): Observable<any> {
        return this.http.get(SERVER_LINK + '/profile/?username=' + this.user.getUsername());
    }

    setProfileInfo(info: ProfileInfo): void {
        this.info = info;
        this.initializeMatchHistory();
        this.initializeGameStats();
    }

    initializeMatchHistory(): void {
        this.matchHistory = [this.info.BR, this.info.FFA]
    }

    initializeGameStats(): void {
        this.gameStat.gamePlayed = this.info.nWins + this.info.nLosses;
        this.gameStat.winrate =  this.info.nWins / this.gameStat.gamePlayed;
        this.gameStat.totalGameTime = this.info.totalGameTimeMinutes;
        this.gameStat.totalTime = this.info.totalTimeMinutes;
    }
}
