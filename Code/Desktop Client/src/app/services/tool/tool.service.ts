import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ToolService {

  toolChange: Subject<boolean>;

  constructor() {
  	this.toolChange = new Subject<boolean>();
  }

  setTool(isPencil = true): void {
  	this.toolChange.next(isPencil);
  }

  changeTool(): Observable<boolean> {
  	return this.toolChange.asObservable();
  }
}
