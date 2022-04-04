import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DEFAULT_GRID_PARAM } from 'src/app/models/constant/drawing/constant';
import { GridParam } from 'src/app/models/interface/grid-element';
import { SPACE } from 'src/constant/constant';
import { LINE_TAG, ORIGIN_TAG } from 'src/constant/svg/constant';

@Injectable({
    providedIn: 'root'
})
export class GridService {

  gridParam: GridParam;
  updateGrid: Subject<void>
  turnGridOn: Subject<void>

  constructor() {
  	this.updateGrid = new Subject<void>();
  	this.turnGridOn = new Subject<void>();
  	this.gridParam = {
  		size: DEFAULT_GRID_PARAM.size,
		  opacity: DEFAULT_GRID_PARAM.opacity,
	  }
  }

  sendGridUpdate(): void {
  	this.updateGrid.next();
  }

  getGridUpdate(): Observable<void> {
  	return this.updateGrid.asObservable();
  }

  sendGridState(): void {
  	this.turnGridOn.next();
  }

  getGridState(): Observable<void> {
  	return this.turnGridOn.asObservable();
  }

  generateGridElement(width: number, height: number): string {
      let gridPath = '';
  	for (let i = 0; i < width; i += this.gridParam.size) {
		  gridPath = gridPath + ORIGIN_TAG + i + SPACE + 0 + LINE_TAG + i + SPACE + height;
  	}
  	for (let y = 0; y < height; y += this.gridParam.size) {
		  gridPath = gridPath + ORIGIN_TAG + 0 + SPACE + y + LINE_TAG + width + SPACE + y
	  }
	
      return gridPath
  }

}
