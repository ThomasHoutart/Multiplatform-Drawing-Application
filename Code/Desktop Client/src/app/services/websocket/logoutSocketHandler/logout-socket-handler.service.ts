import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
    providedIn: 'root'
})
export class LogoutSocketHandlerService {

    constructor(private socket: Socket) {

    }

    logout(): void {
        this.socket.emit('UserLogout');
    }
}
