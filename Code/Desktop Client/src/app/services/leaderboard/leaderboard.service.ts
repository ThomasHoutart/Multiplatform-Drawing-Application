import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SERVER_LINK } from 'src/app/models/constant/drawing/constant';
import {LEADERBOARD_HTTP_REQUEST} from './constant';

@Injectable({
    providedIn: 'root'
})
export class LeaderboardService {

    constructor(private http: HttpClient) { }

    getLeaderboard(): Observable<any> {
        return this.http.get(SERVER_LINK + LEADERBOARD_HTTP_REQUEST);
    }


}
