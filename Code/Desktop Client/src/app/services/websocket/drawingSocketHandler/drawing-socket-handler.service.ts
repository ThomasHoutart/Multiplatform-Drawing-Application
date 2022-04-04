import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';
import { DrawingMessage } from 'src/app/models/interface/drawing-message';
import { Point } from 'src/interface/Point';

@Injectable({
    providedIn: 'root'
})
export class DrawingSocketHandlerService {

    setPath: Subject<DrawingMessage>;
    appendPath: Subject<Point>;

    constructor(private socket: Socket) {
        this.setPath = new Subject<DrawingMessage>();
        this.appendPath = new Subject<Point>();
    }

    public setNewPath(path: DrawingMessage): void {
        this.socket.emit('SetPath', path);
    }

    public appendToPath(point: Point): void {
        this.socket.emit('AppendToPath', point);
    }

    public onSetPath(): void {
        this.socket.on('SetPath', (path: DrawingMessage) => {
            this.setPath.next(path);
        })
    }

    public onAppendPath(): void {
        this.socket.on('AppendToPath', (point: Point) => {
            this.appendPath.next(point);
        })
    }

    public getSetPathUpdate(): Observable<DrawingMessage> {
        return this.setPath.asObservable();
    }

    public getAppendPathUpdate(): Observable<Point> {
        return this.appendPath.asObservable();
    }

    public listen(): void {
        this.onSetPath();
        this.onAppendPath();
    }
}
