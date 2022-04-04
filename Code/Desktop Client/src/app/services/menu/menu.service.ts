import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MenuService {

  updateBar: Subject<boolean>

  constructor() {
      this.updateBar = new Subject<boolean>();
  }

  updateBarMenu(isExitButton: boolean): void {
      this.updateBar.next(isExitButton)
  }

  getBarMenuUpdate(): Observable<boolean> {
      return this.updateBar.asObservable();
  }
}
