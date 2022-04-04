import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LeaveNewPasswordComponent } from 'src/app/components/warning/leave-new-password/leave-new-password.component';
import { RoutingService } from 'src/app/services/routing/routing.service';
import { MIN_CHARACTERS_USER, MAX_CHARACTERS_USER } from '../../create-account/constant';
import { PASSWORD_CONFIRM_MATCHING_ERROR } from '../constant';

@Component({
    selector: 'app-new-password',
    templateUrl: './new-password.component.html',
    styleUrls: ['./new-password.component.css']
})
export class NewPasswordComponent implements OnInit {

    form: FormGroup;
    errorMessage: string;
    loading: boolean;

    constructor(
      private formBuilder: FormBuilder,
      private routing: RoutingService,
      public dialog: MatDialog,) {
        this.errorMessage = '';
        this.loading = false;
    }

    onChange(): void {
        // temp, until server is implemented
        this.errorMessage = ''
        if (this.form.get('password').value === this.form.get('confirm').value) {
            this.routing.moveToLogin();
        } else {
            this.errorMessage = PASSWORD_CONFIRM_MATCHING_ERROR
        }
    }

    onBack(): void {
        const dialogRef = this.dialog.open(LeaveNewPasswordComponent);
        dialogRef.afterClosed().subscribe((isConfirmed) => {
            if (isConfirmed) {
                this.routing.moveToLogin();
            }
        });
    }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            password: ['', [Validators.required, Validators.minLength(MIN_CHARACTERS_USER),
                Validators.maxLength(MAX_CHARACTERS_USER)]],
            confirm: ['', [Validators.required, Validators.minLength(MIN_CHARACTERS_USER),
                Validators.maxLength(MAX_CHARACTERS_USER)]],
        });
    }
}
