import { Injectable } from '@angular/core';
import { DEFAULT_PATH_PARAM } from 'src/app/models/constant/drawing/constant';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { PencilService } from 'src/app/services/tool/pencil/pencil.service';
import { KeyModifier } from 'src/interface/key-modifier';
import { Point } from 'src/interface/Point';
import { ParamPath } from 'src/interface/trace/pencil';
import { ToolHandler } from '../../tool-handler.service';

@Injectable({
    providedIn: 'root',
})
export class PencilToolHandlerService extends ToolHandler {

  isMouseDown: boolean;
  currentPath: string;
  currentPathParam: ParamPath;

  constructor(private drawing: DrawingService, private pencil: PencilService) {
  	super();
  	this.isMouseDown = false;
  	this.currentPathParam = DEFAULT_PATH_PARAM;
  }

  private newPath(event: MouseEvent, isNewPath = true): void {
  	const newPath = this.pencil.createPath( {x: event.offsetX, y: event.offsetY} as Point,
  		this.currentPathParam);
  	this.drawing.addNewPath(newPath, isNewPath);
  	this.currentPath = newPath.path;
  }

  handleMouseDown(event: MouseEvent, keyModifier: KeyModifier): void {
  	if (!this.isMouseDown && keyModifier.leftKey) {
  		this.newPath(event)
  		this.isMouseDown = true;
  	}
  }

  handleMouseUp(event: MouseEvent, keyModifier: KeyModifier): void {
  	//this.actionService.addAction(this);
  	if (keyModifier.leftKey) {
  		this.isMouseDown = false;
  		this.drawing.sendActionUpdate();
  	}
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleMouseMove(event: MouseEvent, keyModifier: KeyModifier): void {
  	if (this.isMouseDown) {
  		this.currentPath = this.pencil.getUpdatedPath(this.currentPath, {x: event.offsetX, y: event.offsetY} as Point);
  		this.drawing.updatePath(this.currentPath, {x: event.offsetX, y: event.offsetY} as Point);
  	}
  }

  handleMouseLeave(): void {
  	if (this.isMouseDown) {
  		this.isMouseDown = false;
  		this.drawing.sendActionUpdate();
  	}
  }

  handleUndo(): void {
  	//this.pencilService.removeElement(this.pencil);
  }
  handleRedo(): void {
  	//this.pencilService.reAddElement(this.pencil);
  }

  storeAction(): PencilToolHandlerService {
  	/*
    const copy = Object.create(this);
    copy.elementRef = this.elementRef;
    copy.pencil = this.pencil;
    return copy;
    */
  	return this;
  }

  // tslint:disable-next-line: no-empty
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDoubleClick(event: MouseEvent, keyModifier: KeyModifier): void {return}
  // tslint:disable-next-line: no-empty
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleMouseWheel(event: MouseEvent, keyModifier: KeyModifier): void {return}

  handleDrawingLoad(): void {
  	/*
    for (const element of this.drawingService.getElementsTable(PENCIL)) {
      const pencil: Pencil =
      this.pencilService.createPencilFromSVGElement(element);
      this.drawingElementManager.appendDrawingElement(pencil);
    }
    */
  }

  // tslint:disable-next-line: no-empty
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleShortcuts(event: KeyboardEvent): void {return}
  // tslint:disable-next-line: no-empty
  handleCurrentToolChange(): void {return}
}
