import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-join-create-game',
    templateUrl: './join-create-game.component.html',
    styleUrls: ['./join-create-game.component.css']
})
export class JoinCreateGameComponent implements OnInit {

  form: FormGroup;
  public fetchedList: boolean;


  constructor(public dialogRef: MatDialogRef<JoinCreateGameComponent>,
              private formBuilder: FormBuilder) {
  	this.fetchedList = false;
  }

  onChange(): void {
  	//this.filteredRoomList = this.room.updateRoomSearchList(this.roomList, this.form.get('room').value);
  }

  onJoin(): void {

  	this.dialogRef.close();
  }

  onCreate(): void {
  	this.dialogRef.close();
  }

  onCancel(): void {
  	this.dialogRef.close();
  }

  ngOnInit(): void {
  	// needs a regex for name
  	this.form = this.formBuilder.group({
  		game: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(30)]],
  	});

  }

}
