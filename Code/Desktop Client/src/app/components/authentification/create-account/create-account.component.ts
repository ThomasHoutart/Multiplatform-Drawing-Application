import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { CredentialCreation } from 'src/app/models/interface/user';
import { AvatarService } from 'src/app/services/avatar/avatar.service';
import { HashService } from 'src/app/services/hash/hash.service';
import { RoutingService } from 'src/app/services/routing/routing.service';
import { UserService } from 'src/app/services/user/user.service';
import { EMAIL_REGEX, MAX_CHARACTERS, MAX_CHARACTERS_EMAIL, MAX_CHARACTERS_USER, MIN_CHARACTERS,
    MIN_CHARACTERS_USER, NAME_REGEX, REGISTER_HTTP, USERNAME_REGEX } from './constant';

@Component({
    selector: 'app-create-account',
    templateUrl: './create-account.component.html',
    styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit {

  form: FormGroup;
  loading: boolean;
  dupUsername: boolean;
  dupEmail: boolean;
  badRequest: boolean;
  selectedAvatar: number


  constructor(
    public formBuilder: FormBuilder,
    private routing: RoutingService,
    private hasher: HashService,
	private http: HttpClient,
	private avatar: AvatarService,
	private user: UserService) {
      this.loading = false
      this.dupUsername = false;
  		this.dupEmail = false;
      this.badRequest = false;
      this.selectedAvatar = 0;
  }

  public avatarUrl(index: number): string {
      return this.avatar.getAvatarUrlString(index);
  }

  public createAccount(): void {
  	this.dupUsername = false;
  	this.dupEmail = false;
  	this.badRequest = false;
  	this.loading = true;
  	const credential: CredentialCreation = {
  		firstName: this.form.get('firstName').value,
  		lastName: this.form.get('lastName').value,
  		username: this.form.get('username').value,
  		email: this.form.get('email').value,
          hash: (this.hasher.hashString(this.form.get('password').value)).toString(),
          avatar: this.selectedAvatar,
  	};
  	this.registerAccount(credential);
  }

  registerAccountPostRequest(credential: CredentialCreation): Observable<any> {
  	return this.http.post(REGISTER_HTTP, credential);
  }

  public changeAvatar(avatar: number): void {
	  this.selectedAvatar = avatar;
  }

  public registerAccount(credential: CredentialCreation): void {
  	this.registerAccountPostRequest(credential).subscribe(
  		// eslint-disable-next-line @typescript-eslint/no-unused-vars
  		(response) => {
			  this.user.setAccountCreated(this.form.get('username').value);
			  this.routing.moveToLogin();
          },

  		(error) => {
  			this.handleError(error.status);
  		}
  	);
  }

  public handleError(status: number): void {
  	this.loading = false;
  	if (status === 200) {
          this.user.setAccountCreated(this.form.get('username').value);
  		this.routing.moveToLogin();
  	} else if (status === 409) {
  		this.dupUsername = true;
  	} else if (status === 410) {
  		this.dupEmail = true;
  	} else {
  		this.badRequest = true;
  	}
  }

  public onCancel(): void {
  	this.routing.moveToLogin();
  }

  private initForm() {
  	this.form = this.formBuilder.group({
  		firstName: ['', [Validators.required, Validators.pattern(NAME_REGEX),
  			Validators.minLength(MIN_CHARACTERS), Validators.maxLength(MAX_CHARACTERS)]],
  		lastName: ['', [Validators.required, Validators.pattern(NAME_REGEX),
  			Validators.minLength(MIN_CHARACTERS), Validators.maxLength(MAX_CHARACTERS)]],
  		username: ['', [Validators.required, Validators.pattern(USERNAME_REGEX),
  			Validators.minLength(MIN_CHARACTERS_USER), Validators.maxLength(MAX_CHARACTERS_USER)]],
  		password: ['', [Validators.required, Validators.minLength(MIN_CHARACTERS_USER),
  			Validators.maxLength(MAX_CHARACTERS_USER)]],
  		email: ['', [Validators.required, Validators.pattern(EMAIL_REGEX),
  			Validators.minLength(MIN_CHARACTERS), Validators.maxLength(MAX_CHARACTERS_EMAIL)]],
  	});
  }

  ngOnInit(): void {
  	this.initForm();
  }

}
