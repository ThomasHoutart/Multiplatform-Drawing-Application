// import { ElementRef } from '@angular/core';
import { Action } from './action';

export interface DrawingElement extends Action {
    ref: any;
}

export interface Dimension {
    height: number;
    width: number;
}
