import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import {
    EMAIL_REGEX,
    MAX_CHARACTERS,
    MAX_CHARACTERS_EMAIL,
    MAX_CHARACTERS_USER,
    MIN_CHARACTERS,
    MIN_CHARACTERS_USER,
    NAME_REGEX,
    USERNAME_REGEX,
} from 'src/app/components/authentification/create-account/constant';
import { AvatarService } from 'src/app/services/avatar/avatar.service';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit {
  form: FormGroup;
  selectedAvatar: number
  loading = false;
  dupUsername = false;
  dupEmail = false;
  badRequest = false;

  constructor(public formBuilder: FormBuilder, private avatar: AvatarService, public dialogRef: MatDialogRef<EditComponent>) {
      this.selectedAvatar = 0;
      return;
  }

  public onCancel(): void {
      this.dialogRef.close();
  }
  
  public changeAvatar(avatar: number): void {
	  this.selectedAvatar = avatar;
  }

  public avatarUrl(index: number): string {
      return this.avatar.getAvatarUrlString(index);
  }

  // eslint-disable-next-line max-lines-per-function
  private initForm() {
      this.form = this.formBuilder.group({
          firstName: [
              '',
              [
                  Validators.required,
                  Validators.pattern(NAME_REGEX),
                  Validators.minLength(MIN_CHARACTERS),
                  Validators.maxLength(MAX_CHARACTERS),
              ],
          ],
          lastName: [
              '',
              [
                  Validators.required,
                  Validators.pattern(NAME_REGEX),
                  Validators.minLength(MIN_CHARACTERS),
                  Validators.maxLength(MAX_CHARACTERS),
              ],
          ],
          username: [
              '',
              [
                  Validators.required,
                  Validators.pattern(USERNAME_REGEX),
                  Validators.minLength(MIN_CHARACTERS_USER),
                  Validators.maxLength(MAX_CHARACTERS_USER),
              ],
          ],
          password: [
              '',
              [
                  Validators.required,
                  Validators.minLength(MIN_CHARACTERS_USER),
                  Validators.maxLength(MAX_CHARACTERS_USER),
              ],
          ],
          email: [
              '',
              [
                  Validators.required,
                  Validators.pattern(EMAIL_REGEX),
                  Validators.minLength(MIN_CHARACTERS),
                  Validators.maxLength(MAX_CHARACTERS_EMAIL),
              ],
          ],
      });
  }

  ngOnInit(): void {
      this.initForm();
  }
}
