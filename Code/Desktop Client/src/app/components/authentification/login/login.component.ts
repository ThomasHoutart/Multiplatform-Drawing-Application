import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { Salt } from 'src/app/models/interface/salt';
import { LoginCredential } from 'src/app/models/interface/user';
import { HashService } from 'src/app/services/hash/hash.service';
import { RoutingService } from 'src/app/services/routing/routing.service';
import { SoundsService } from 'src/app/services/sounds/sounds.service';
import { UserService } from 'src/app/services/user/user.service';
import { USER_DOES_NOT_EXIST_ERROR_MESSAGE } from 'src/app/services/websocket/error/constant';
import { ErrorSocketHandlerService } from 'src/app/services/websocket/error/error-socket-handler.service';
import { SUCCESS } from 'src/app/services/websocket/loginSocketHandler/constant';
import { LoginSocketHandlerService } from 'src/app/services/websocket/loginSocketHandler/login-socket-handler.service';
import { TutorielComponent } from '../../tutoriel/tutoriel.component';
import { AUTHENTICATION_HTTP } from './constant';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

    form: FormGroup;
    loginSubscription: Subscription;
    errorSubscription: Subscription;
    loading = false;
    errorMessage: string;
    salt: Salt;


    constructor(
        private formBuilder: FormBuilder,
        private routing: RoutingService,
        private socket: LoginSocketHandlerService,
        private hasher: HashService,
        private user: UserService,
        private sounds: SoundsService,
        private http: HttpClient,
        private errorSocket: ErrorSocketHandlerService,
        public dialog: MatDialog,) {
        this.errorMessage = '';
    }

    onSubmit(): void {
        this.loading = true;
        this.errorMessage = '';
        this.handleLoginInfo();
    }

    userAuthenticationRequest(): Observable<any> {
        return this.http.get(AUTHENTICATION_HTTP + this.form.get('username').value);
    }

    handleLoginInfo(): void {
        this.userAuthenticationRequest().subscribe((salt: Salt) => {
            const loginCredential: LoginCredential = {
                username: this.form.get('username').value,
                hash: this.hasher.encryptedPassword(this.form.get('password').value, salt),
            };
            this.user.setUser(loginCredential);
            this.socket.sendLoginInfo(loginCredential);
        }, () => {
            this.loading = false;
            this.errorMessage = USER_DOES_NOT_EXIST_ERROR_MESSAGE;
        });
    }

    onCreateAccount(): void {
        this.routing.moveToCreateAccount();
    }

    onForgotPassword(): void {
        this.routing.moveToForgotPassword();
    }

    loginListener(): void {
        this.loginSubscription = this.socket.getLoginUpdate().subscribe((message: string) => {
            this.loading = false;
            if (message === SUCCESS) {
                this.sounds.playLogInSound();
                if (this.user.accountCreated === this.form.get('username').value)
                    this.dialog.open(TutorielComponent, {
                        hasBackdrop: true,
                        disableClose: true,
                    });
                this.routing.moveToMenu();
            } else
                this.errorMessage = message;
        });
    }

    errorListener(): void {
        this.errorSubscription = this.errorSocket.getLoginErrors().subscribe((error: string) => {
            this.loading = false;
            this.user.resetUser();
            this.errorMessage = error;
        })
    }


    ngOnInit(): void {
        this.form = this.formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]],
        });

        this.loginListener();
        this.errorListener();
        this.socket.loginVerification();
    }

    ngOnDestroy(): void {
        this.loginSubscription.unsubscribe();
        this.errorSubscription.unsubscribe();
        this.socket.loginRemoveListeners();
    }

}
