import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { EMPTY_PATH } from 'src/app/models/constant/drawing/constant';
import { KeyModifier } from 'src/interface/key-modifier';
import { Point } from 'src/interface/Point';
import { Path } from 'src/interface/trace/pencil';
import { DrawingService } from '../../drawing/drawing.service';
import { ToolHandler } from '../tool-handler.service';

@Injectable({
    providedIn: 'root',
})
export class EraserToolHandlerService extends ToolHandler {

  mouseDown: boolean;
  updateEraserPosition: Subject<Point>;
  updateEraserSize: Subject<number>;
  SelectedElement: Path;
  inSurface: boolean;

  constructor(public drawing: DrawingService) {
  	super();
  	this.updateEraserPosition = new Subject<Point>();
  	this.updateEraserSize = new Subject<number>();
      this.SelectedElement = EMPTY_PATH;
      this.inSurface = true;
  }

  public sendUpdateEraserSize(size: number): void {
      this.updateEraserSize.next(size);
  }

  public getEraserSizeUpdate(): Observable<number> {
      return this.updateEraserSize.asObservable();
  }

  private updateCoordinate(coordinates: Point): void {
  	this.updateEraserPosition.next(coordinates);
  }

  public getEraserCoordinate(): Observable<Point> {
  	return this.updateEraserPosition.asObservable();
  }

  handleMouseDown(event: MouseEvent, keyModifier: KeyModifier): void {
  	if (!this.mouseDown && keyModifier.leftKey) {
  		if (this.SelectedElement !== EMPTY_PATH) {
  			this.drawing.deletePath(this.SelectedElement.shareId);
  			this.SelectedElement = EMPTY_PATH;
  		}
  		this.mouseDown = true;
  	}
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  handleMouseUp(event: MouseEvent, keyModifier: KeyModifier) {
  	if (keyModifier.leftKey) {
  		this.drawing.sendActionUpdate();
  		this.mouseDown = false;
  	}
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleMouseMove(event: MouseEvent, keyModifier: KeyModifier): void {
      this.inSurface = true;
  	this.updateCoordinate({x: event.offsetX, y: event.offsetY} as Point)
  	if (this.mouseDown) {
  		if (this.SelectedElement !== EMPTY_PATH) {
  			this.drawing.deletePath(this.SelectedElement.shareId);
  			this.SelectedElement = EMPTY_PATH;
  		}
  	}
  }

  handleMouseLeave(): void {
      this.inSurface = false
  	this.mouseDown = false;
  }

  storeAction(): EraserToolHandlerService {
  	return this;
  }

  handleUndo(): void {
  	return;
  }

  handleRedo(): void {
  	return;
  }

  handleCurrentToolChange(): void {
  	return;
  }

  // tslint:disable-next-line: no-empty
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDoubleClick(event: MouseEvent, keyModifier: KeyModifier): void {
      return;
  }
  // tslint:disable-next-line: no-empty
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleMouseWheel(event: MouseEvent, keyModifier: KeyModifier): void {
      return;
  }
  // tslint:disable-next-line: no-empty
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleShortcuts(keyModifier: KeyboardEvent): void {
      return;
  }
  // tslint:disable-next-line: no-empty
  handleDrawingLoad(): void {
      return;
  }
}
