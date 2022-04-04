import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { LobbyService } from 'src/app/services/lobby/lobby.service';
import { ErrorSocketHandlerService } from 'src/app/services/websocket/error/error-socket-handler.service';

@Component({
    selector: 'app-lobby-creation',
    templateUrl: './lobby-creation.component.html',
    styleUrls: ['./lobby-creation.component.css']
})
export class LobbyCreationComponent implements OnInit {
    form: FormGroup;
    error: Subscription;
    errorMessage1: string;
    errorMessage2: string;
    lobbyCreate: Subscription;
    constructor(
        public dialogRef: MatDialogRef<LobbyCreationComponent>,
        private formBuilder: FormBuilder,
        private lobby: LobbyService,
        private socket: ErrorSocketHandlerService) {
            this.errorMessage1 = '';
            this.errorMessage2 = '';
        }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
  		lobby: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(30)]],
          });
          this.onLobbyError();
          this.onLobbyCreate();
    }

    showErrorMessage(): boolean {
        if (this.errorMessage1 == "") {
            return false
        }
        return true
    }

    public onLobbyError(): void {
        this.error = this.socket.getLobbyErrors().subscribe((error: string) => {
            this.errorMessage1 = "This name is already in use by another";
            this.errorMessage2 = "lobby. Please try another one.";
        })
    }

    public onLobbyCreate(): void  {
        this.lobbyCreate = this.lobby.lobbyCreationListeners().subscribe(() => {
            this.dialogRef.close();
        })
    }
  
    public onCreate(): void {
        this.lobby.initiateLobbyCreation(this.form.get('lobby').value);
        this.errorMessage1 = '';
        this.errorMessage2 = '';
        //this.dialogRef.close();
    }

    public onCancel(): void {
        this.dialogRef.close();
    }
}
