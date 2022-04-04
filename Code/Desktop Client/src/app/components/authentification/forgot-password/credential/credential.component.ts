import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService } from 'src/app/services/confirmation/confirmation.service';
import { ForgotPasswordService } from 'src/app/services/forgot-password/forgot-password.service';
import { RoutingService } from 'src/app/services/routing/routing.service';
import { BAD_USERNAME_ERROR, PASSWORD_STATE } from '../constant';

@Component({
    selector: 'app-credential',
    templateUrl: './credential.component.html',
    styleUrls: ['./credential.component.css']
})
export class CredentialComponent implements OnInit {

    form: FormGroup;
    errorMessage: string;
    loading: boolean;

    constructor(
      private formBuilder: FormBuilder,
      private routing: RoutingService,
      private forgotPassword: ForgotPasswordService,
      private confirmation: ConfirmationService) {
        this.errorMessage = '';
        this.loading = false;
    }

    onConfirm(): void {
        // temp, until server is implemented
        this.loading = true;
        this.errorMessage = '';
        this.onServerResponse(this.form.get('credential').value === 'test')
    }

    onServerResponse(success: boolean): void {
        if (success) {
            this.confirmation.isForgotPassword = true;
            this.forgotPassword.setForgotPasswordState(PASSWORD_STATE); // CONFIRMATION_STATE if implemented
        } else {
            this.loading = false;
            this.errorMessage = BAD_USERNAME_ERROR;
        }
    }

    onBack(): void {
        this.routing.moveToLogin();
    }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            credential: ['', [Validators.required]],
        });
    }

}
