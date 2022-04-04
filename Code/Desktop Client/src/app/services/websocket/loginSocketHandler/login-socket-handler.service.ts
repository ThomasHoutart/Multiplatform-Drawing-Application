import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';
import { CredentialError } from 'src/app/models/interface/error';
import { LoginCredential } from 'src/app/models/interface/user';
import { UserInformation } from 'src/app/models/interface/user-info';
import { UserService } from '../../user/user.service';
import { SUCCESS } from './constant';

@Injectable({
    providedIn: 'root'
})
export class LoginSocketHandlerService {

  private login: Subject<string>;

  constructor(private socket: Socket, private user: UserService) {
  	this.login = new Subject<string>();
  }

  public getLoginUpdate(): Observable<string> {
  	return this.login.asObservable();
  }

  private sendLoginUpdate(message: string): void {
  	this.login.next(message);
  }

  public sendLoginInfo(loginCredential: LoginCredential): void {
  	this.socket.emit('UserLogin', loginCredential);
  }

  private loginSuccesVerification(): void {
  	this.socket.on('UserAuthenticated', (message: UserInformation) => {
          this.user.userInfo.hashSocketId = message.hashSocketId;
          this.user.userInfo.firstName = message.firstName;
          this.user.userInfo.lastName = message.lastName;
  		this.sendLoginUpdate(SUCCESS);
  	});
  }

  private loginErrorVerification(): void {
  	this.socket.on('LOGIN_ERROR', (error: CredentialError) => {
  		this.sendLoginUpdate(error.ID);
  	});
  }

  private loginBanVerification(): void {
      this.socket.on('UserCheatedError', () => {
          this.sendLoginUpdate('You have been banned. You will be able to login with this account in a few minutes.')
      })  
  }

  public loginVerification(): void {
  	this.loginSuccesVerification();
      this.loginErrorVerification();
      this.loginBanVerification()
  }

  public loginRemoveListeners(): void {
  	this.socket.removeListener('UserAuthenticated');
  	this.socket.removeListener('LOGIN_ERROR');
  }
}
