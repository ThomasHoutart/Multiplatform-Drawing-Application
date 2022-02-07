import { DrawingElement } from './drawing-element';

export interface Drawing {
    name: string;
    drawing: DrawingElement[];
    tags?: string[];
}
