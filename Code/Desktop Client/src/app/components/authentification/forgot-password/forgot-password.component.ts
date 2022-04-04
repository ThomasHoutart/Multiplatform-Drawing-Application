import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ForgotPasswordService } from 'src/app/services/forgot-password/forgot-password.service';
import { RoutingService } from 'src/app/services/routing/routing.service';
import { USERNAME_STATE } from './constant';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {

    form: FormGroup;
    errorMessage: string;
    loading: boolean;
    state: string;
    changeStateListener: Subscription;

    constructor(
        private formBuilder: FormBuilder, 
        private routing: RoutingService,
        private forgotPassword: ForgotPasswordService) {
        this.errorMessage = '';
        this.loading = false;
        this.state = USERNAME_STATE;
    }


    onBack(): void {
        this.routing.moveToLogin();
    }

    forgotPasswordStateListener(): void {
        this.changeStateListener = this.forgotPassword.getForgotPasswordStateUpdate().subscribe((state: string) => {
            this.state = state;
        })
    }

    listen(): void {
        this.forgotPasswordStateListener();
    }

    terminate(): void {
        this.changeStateListener.unsubscribe();
    }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            username: ['', [Validators.required]],
        });
        this.listen();
    }

    ngOnDestroy(): void {
        this.terminate();
    }

}
