import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ForgotPasswordService {

  forgotPasswordState: Subject<string>;

  constructor() {
      this.forgotPasswordState = new Subject<string>();
  }

  getForgotPasswordStateUpdate(): Observable<string> { 
      return this.forgotPasswordState.asObservable();
  }

  setForgotPasswordState(state: string): void {
      this.forgotPasswordState.next(state);
  }
}
