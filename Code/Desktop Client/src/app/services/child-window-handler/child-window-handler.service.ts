import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
//const electron = (<any>window).require('electron');

@Injectable({
    providedIn: 'root'
})

export class ChildWindowHandlerService {

  private messageSource = new BehaviorSubject('');
  currentChatState = this.messageSource.asObservable(); // needs to be a function rather then a variable

  constructor() {
  	this.changeChatStateListener();
  }

  changeChatStateListener(): void {
  	// electron.ipcRenderer.on('close-chat-window', (event, message) => {
  	//   this.changeChatState("INTEGRATED");
  	// });
  }
  changeChatState(chatState: string): void {
  	this.messageSource.next(chatState);
  }

  // sert juste a debuger avec electron , a effacer plus tard
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sendLog(message: string): void {
      // electron.ipcRenderer.send('log', message);
  }

  openChatWindow(): void {
      // electron.ipcRenderer.send('open-chat-window', "new chat window");
  }
}
