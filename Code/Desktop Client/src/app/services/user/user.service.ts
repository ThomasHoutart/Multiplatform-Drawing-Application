import { Injectable } from '@angular/core';
import { LoginCredential, ONLINE, Status } from 'src/app/models/interface/user';
import { UserInformation } from 'src/app/models/interface/user-info';
import { EMPTY, INVALID_USERNAME } from './constant';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    public user: LoginCredential;
    public status: Status;
    public picture: string;
    public userInfo: UserInformation;
    public accountCreated: string;

    constructor() {
        this.status = {
            status: ONLINE,
            isSpectator: false,
            isHost: false,
        }
        this.user = { username: 'admin', hash: 'none' };
        this.userInfo = {
            hashSocketId: '',
            firstName: '',
            lastName: '',
            email: '',
            avatar: 0 };
        this.accountCreated = '';
    }

    public setAccountCreated(username: string): void {
        this.accountCreated = username;
    }

    public setUser(user: LoginCredential): void {
        this.user = user;
    }

    public resetUser(): void {
        this.user =
        {
            username: EMPTY,
            hash: EMPTY,
        };
    }

    public getUsername(): string {
        return this.user.username ? this.user.username : INVALID_USERNAME;
    }
}
