import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Point } from 'src/interface/Point';
import { Path } from 'src/interface/trace/pencil';
import { GameService } from '../game/game.service';

@Injectable({
    providedIn: 'root'
})
export class DrawingService {

  public drawingElements: Path[];
  currentPath: number;
  updateDrawingTable: Subject<Path[]>;
  updateActionTable: Subject<Path[]>

  constructor(private game: GameService) {
  	this.drawingElements = [];
  	this.updateDrawingTable = new Subject<Path[]>();
  	this.updateActionTable = new Subject<Path[]>();
  	this.currentPath = 1;
  }

  public getDrawingUpdate(): Observable<Path[]> {
  	return this.updateDrawingTable.asObservable();
  }

  public sendDrawingUpdate(): void {
  	this.updateDrawingTable.next(this.drawingElements)
  }

  public getActionUpdate(): Observable<Path[]> {
  	return this.updateActionTable.asObservable();
  }

  public sendActionUpdate(): void {
  	this.updateActionTable.next(this.drawingElements);
  }

  resetDrawing(): void {
  	this.drawingElements = [];
  	this.currentPath = 1;
  }

  getPathIndex(id: number): number {
  	for (let i = 0; i < this.drawingElements.length; i++) {
  		if (this.drawingElements[i].uniqueId === id) {
  			return i;
  		}
  	}

  	return -1;
  }

  addNewPath(path: Path, isNewPath = true): void {
  	path.uniqueId = this.currentPath;
  	try {
  		path.shareId = isNewPath ? path.uniqueId : this.drawingElements[this.drawingElements.length - 1].shareId
  	} catch(e) {
  		(console).log('empty table');
  	}
  	this.drawingElements.push(path);
  	this.currentPath++;
  	this.sendDrawingUpdate();
  	this.game.setPathToServer(path);
  }

  updatePath(path: string, point: Point): void {
  	if (this.getPathIndex(this.currentPath - 1) !== -1) {
  		this.drawingElements[this.getPathIndex(this.currentPath - 1)].path = path;
  		this.sendDrawingUpdate();
  		this.game.updatePathToServer(point);
  	}
  }

  deletePath(sharedId: number): void {
  	try {
  		this.deletePathServer(this.drawingElements[this.getPathIndex(sharedId)]);
  	} catch(e) {(console).log(e)}
  	this.drawingElements = this.drawingElements.filter(element => {
  		return element.shareId !== sharedId;
  	});
  	this.sendDrawingUpdate();
  }

  deletePathServer(path: Path): void {
      if (this.game.isUserDrawing) {
          path.path = '';
          this.game.setPathToServer(path);
      }
  }

  addPathServer(path: Path): void {
  	if (this.game.isUserDrawing) {
  		this.game.setPathToServer(path);
  	}
  }
}
