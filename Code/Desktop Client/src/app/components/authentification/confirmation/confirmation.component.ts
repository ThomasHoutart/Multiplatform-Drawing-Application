import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService } from 'src/app/services/confirmation/confirmation.service';
import { ForgotPasswordService } from 'src/app/services/forgot-password/forgot-password.service';
import { RoutingService } from 'src/app/services/routing/routing.service';
import { BAD_CODE_ERROR, PASSWORD_STATE } from '../forgot-password/constant';

@Component({
    selector: 'app-confirmation',
    templateUrl: './confirmation.component.html',
    styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {

    form: FormGroup;
    errorMessage: string;
    loading: boolean;

    constructor(
        private formBuilder: FormBuilder,
        private routing: RoutingService,
        private forgotPassword: ForgotPasswordService,
        private confirm: ConfirmationService) {
        this.errorMessage = '';
        this.loading = false;
    }

    onConfirm(): void {
        // temp, until server is implemented
        this.loading = true;
        this.errorMessage = '';
        this.onServerResponse(this.form.get('code').value === '1111');
    }

    onServerResponse(success: boolean): void {
        if (success) {
            this.confirm.isForgotPassword ? 
                this.forgotPassword.setForgotPasswordState(PASSWORD_STATE) :
                this.routing.moveToLogin();
        } else {
            this.loading = false;
            this.errorMessage = BAD_CODE_ERROR;
        }
    }

    onBack(): void {
        this.routing.moveToLogin();
    }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            code: ['', [Validators.required]],
        });
    }

}
