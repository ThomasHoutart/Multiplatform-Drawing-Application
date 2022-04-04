import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SERVER_LINK } from '../../models/constant/drawing/constant';
import { UserService } from '../user/user.service';

@Injectable({
    providedIn: 'root'
})
export class AchievementsHandlerService {

    constructor(private http: HttpClient, private user: UserService) { }

    public getAllAchievements(): Observable<any> {
        return this.http.get(SERVER_LINK + '/achievement/?username=' + this.user.getUsername());
    }
}
