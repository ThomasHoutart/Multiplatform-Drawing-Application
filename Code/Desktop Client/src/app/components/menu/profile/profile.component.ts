import { Component } from '@angular/core';
import { AvatarService } from 'src/app/services/avatar/avatar.service';
import { UserService } from 'src/app/services/user/user.service';
import { ProfileService } from 'src/app/services/profile/profile.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {

    public isStatsDisplayed = false;
    public username: string;
    public firstName: string;
    public lastName: string;
    public email: string;
    public avatar: string;
    public showGamesHistory: boolean;
    public infoValue: any;
    public showStats: boolean;

    constructor(private userService: UserService, private avatarService: AvatarService, private profile: ProfileService) {
        this.initValues();
        this.showGamesHistory = false;
        this.infoValue = "generalStats";
        this.showStats = true;
    }

    public initValues(): void {
        this.username = this.userService.getUsername();
        this.firstName = this.userService.userInfo.firstName;
        this.lastName = this.userService.userInfo.lastName;
        this.avatar = this.avatarService.getAvatarUrlString(this.userService.userInfo.avatar);
    }

    public showMatchHistory(): void {
        this.showGamesHistory = true;
        this.showStats = false;
    }

    public showConnectionHistory(): void {
        this.showGamesHistory = false;
        this.showStats = false;
    }

    public showGeneralStats(): void {
        this.showGamesHistory = false;
        this.showStats = true;
    }
}
