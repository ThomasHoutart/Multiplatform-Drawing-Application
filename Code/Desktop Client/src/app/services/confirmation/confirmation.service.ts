import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ConfirmationService {

  isForgotPassword: boolean;

  constructor() {
      this.isForgotPassword = false;
  }
}
