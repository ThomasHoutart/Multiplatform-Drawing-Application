import { Injectable } from '@angular/core';
import { SPACE } from 'src/constant/constant';
import { LINE_TAG, ORIGIN_TAG } from 'src/constant/svg/constant';
import { Point } from 'src/interface/Point';
import { ParamPath, Path } from 'src/interface/trace/pencil';

@Injectable({
    providedIn: 'root'
})
export class PencilService {

    constructor() {return}

    createPath(coordinate: Point, parameters: ParamPath): Path {
        return {
            uniqueId: -1,
            shareId: -1,
            path: ORIGIN_TAG + coordinate.x + SPACE + coordinate.y + LINE_TAG + coordinate.x + SPACE + coordinate.y,
            thickness: parameters.thickness,
            color: parameters.color,
            opacity: parameters.opacity,
        } as Path;
    }

    getUpdatedPath(path: string, coordinate: Point): string {
        return path + LINE_TAG + coordinate.x + SPACE + coordinate.y;
    }

}
