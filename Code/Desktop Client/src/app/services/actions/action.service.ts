import { Injectable } from '@angular/core';
import { ONE, ZERO } from 'src/constant/constant';
import { Path } from 'src/interface/trace/pencil';
import { DrawingService } from '../drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class ActionService {

    public actionList: Path[][];
    iteratorIndex: number;

    constructor(private drawing: DrawingService) {
        this.clearActions();
        this.iteratorIndex = 0;
        this.actionList = [[]];
    }

    addAction(action: Path[]): void {
        if (this.iteratorIndex < this.actionList.length - 1) {
            const clonedActionList: Path[][] = this.actionList;
            this.actionList = [];
            for (let i = 0; i < this.iteratorIndex + 1; i++) {
                const clonePath: Path[] = this.clonePaths(clonedActionList[i])
                this.actionList.push(clonePath);
            }
        }
        const clonedArray: Path[] = this.clonePaths(action);
        this.actionList.push(clonedArray);
        this.iteratorIndex += ONE;
    }

    clonePaths(action: Path[]): Path[] {
        const clonedArray: Path[] = [];
        action.forEach(val => clonedArray.push(Object.assign({}, val)));

        return clonedArray;
    }

    getPathIndex(id: number, pathArray: Path[]): number {
        for (let i = 0; i < pathArray.length; i++) {
            if (pathArray[i].uniqueId === id) {
                return i;
            }
        }

        return -1;
    }

    getPathToChange(greaterArray: Path[], smallerArray: Path[]): Path[] {
        return greaterArray.filter(element => this.getPathIndex(element.shareId, smallerArray) < 0);
    }


    clearActions(): void {
        this.actionList = [[]];
        this.iteratorIndex = ZERO;
    }

    undoAction(): void {
        if (this.isUndoAvailable()) {
            this.undoActionServer();
            this.iteratorIndex -= ONE;
            const clonePath: Path[] = this.clonePaths(this.actionList[this.iteratorIndex]);
            this.drawing.drawingElements = clonePath;
            this.drawing.sendDrawingUpdate();
        }
    }

    redoAction(): void {
        if (this.isRedoAvailable()) {
            this.redoActionServer();
            this.iteratorIndex += ONE;
            const clonePath: Path[] = this.clonePaths(this.actionList[this.iteratorIndex]);
            this.drawing.drawingElements = clonePath;
            this.drawing.sendDrawingUpdate();
        }

    }

    undoActionServer(): void {
        const changeAmount: number = this.actionList[this.iteratorIndex].length - this.actionList[this.iteratorIndex - 1].length;
        const greaterArray: Path[] = this.clonePaths(this.actionList[changeAmount > 0 ? this.iteratorIndex : this.iteratorIndex - 1]);
        const smallerArray: Path[] = this.clonePaths(this.actionList[changeAmount < 0 ? this.iteratorIndex : this.iteratorIndex - 1]);
        const currentActionList: Path[] = this.getPathToChange(greaterArray, smallerArray);
        for (let i = 0; i < currentActionList.length; i++) {
            const actionToUndo: Path = currentActionList[i];
            if (changeAmount > 0) {
                this.drawing.deletePathServer(actionToUndo);
            } else {
                this.drawing.addPathServer(actionToUndo);
            }
        }
    }

    redoActionServer(): void {
        const changeAmount: number = this.actionList[this.iteratorIndex].length - this.actionList[this.iteratorIndex + 1].length;
        const greaterArray: Path[] = this.clonePaths(this.actionList[changeAmount > 0 ? this.iteratorIndex : this.iteratorIndex + 1]);
        const smallerArray: Path[] = this.clonePaths(this.actionList[changeAmount < 0 ? this.iteratorIndex : this.iteratorIndex + 1]);
        const currentActionList: Path[] = this.getPathToChange(greaterArray, smallerArray);
        for (let i = 0; i < currentActionList.length; i++) {
            const actionToUndo: Path = currentActionList[i];
            if (changeAmount > 0) {
                this.drawing.deletePathServer(actionToUndo);
            } else {
                this.drawing.addPathServer(actionToUndo);
            }
        }
    }

    isRedoAvailable(): boolean {
        return this.iteratorIndex + 1 < this.actionList.length;
    }

    isUndoAvailable(): boolean {
        return this.iteratorIndex > ZERO;
    }
}
