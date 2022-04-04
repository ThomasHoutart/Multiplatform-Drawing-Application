import { Injectable } from '@angular/core';
import { DrawingMessage } from 'src/app/models/interface/drawing-message';
import { SPACE } from 'src/constant/constant';
import { LINE_TAG, ORIGIN_TAG } from 'src/constant/svg/constant';

@Injectable({
    providedIn: 'root'
})
export class PathConverterService {

    opacityToRgb(value: number): string {
        return Math.round(value * 255).toString()
    }

    rgbToHex(value: string): string {
        const numberV: number = parseFloat(value);
        return numberV.toString(16).length == 2 ? numberV.toString(16) : '0' + numberV.toString(16);
    }

    adjustPathCoordinate(point: string, length: number, size: number): string {
        const newPoint: number = parseFloat(point) * size / length;
        return newPoint.toString();
    }

    getStartPath(serverNumList: string[], serverDrawing: DrawingMessage, canvasSize: number): string {
        return ORIGIN_TAG + this.adjustPathCoordinate(serverNumList[0], serverDrawing.canvasSize, canvasSize)
            + SPACE + this.adjustPathCoordinate(serverNumList[1], serverDrawing.canvasSize, canvasSize)
            + LINE_TAG + this.adjustPathCoordinate(serverNumList[0], serverDrawing.canvasSize, canvasSize)
            + SPACE + this.adjustPathCoordinate(serverNumList[1], serverDrawing.canvasSize, canvasSize);
    }

    convertPathServerToDesktopPath(serverDrawing: DrawingMessage, canvasSize: number): string {
        if (serverDrawing.path.length === 0)
            return '';
        let desktopPath = '';
        const serverNumList: string[] = serverDrawing.path.split(' ');
        desktopPath = this.getStartPath(serverNumList, serverDrawing, canvasSize);
        for (let i = 2; i < serverNumList.length - 1; i += 2)
            desktopPath = desktopPath + LINE_TAG + this.adjustPathCoordinate(serverNumList[i], serverDrawing.canvasSize, canvasSize)
                + SPACE + this.adjustPathCoordinate(serverNumList[i + 1], serverDrawing.canvasSize, canvasSize);
        return desktopPath;
    }

    convertDesktopPathToServerPath(desktopPath: string): string {
        const stringOperation: string = desktopPath.replace(/M/g, '');
        const serverPath: string = stringOperation.replace(/ L/g, '');
        return serverPath.substring(1) + ' ';
    }

    opacityConverter(opacity: string): number {
        return parseInt(opacity, 16) / 255;
    }

    l1tol2(l1: string[]): string[] {
        const l2: string[] = [];
        l2.push('M ' + l1[0] + ' ' + l1[1]);
        for (let i = 2; i < l1.length; i += 2)
            l2.push(' L ' + l1[i] + ' ' + l1[i + 1]);
        return l2;
    }

    segmentDesktopPath(desktopPath: string): string[] {
        const stringOperation: string = desktopPath.replace(/M/g, '');
        const coordOnly: string = stringOperation.replace(/ L/g, '');
        const removeShit: string = coordOnly.substring(1);
        const coordList: string[] = removeShit.split(' ');
        return this.l1tol2(coordList);
    }
}
