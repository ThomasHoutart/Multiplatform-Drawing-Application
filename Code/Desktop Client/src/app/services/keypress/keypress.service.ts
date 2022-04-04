import { Injectable } from '@angular/core';
import {
    DIAMETER_LIMIT, LENGTH_LIMIT, MAX_ANGLE,
    ROTATION_LIMIT,
    THICKNESS_LIMIT,
    Z_KEY
} from 'src/constant/keypress/constant';

@Injectable({
    providedIn: 'root',
})
export class KeypressService {

    static isCtrlZ(event: KeyboardEvent): boolean {
        // tslint:disable-next-line: deprecation
        return event.keyCode === Z_KEY && event.ctrlKey;
    }

    static isCtrlShiftZ(event: KeyboardEvent): boolean {
        // tslint:disable-next-line: deprecation
        return event.keyCode === Z_KEY && event.ctrlKey && event.shiftKey;
    }

    isNumber(event: KeyboardEvent): boolean {
        const key = Number(event.key);
        return !(isNaN(key) || key === null);
    }

    rangeValidator(event: KeyboardEvent, value: number,  max: number): boolean {
        if (this.isNumber(event)) {
            return (value + Number(event.key)) <= max && Number(event.key + value) <= max;
        }

        return false;
    }

    angleValidator(event: KeyboardEvent, value: number): boolean {
        if (this.isNumber(event)) {
            return (value + Number(event.key)) <= MAX_ANGLE;
        }
        return false;
    }

    thicknessValidator(event: KeyboardEvent, thickness: number): boolean {
        if (thickness >= THICKNESS_LIMIT) {
            return false;
        }
        return this.isNumber(event);
    }

    rotationValidator(event: KeyboardEvent, rotation: number): boolean {
        if (rotation > ROTATION_LIMIT) {
            return false;
        }
        return this.isNumber(event);
    }

    diameterValidator(event: KeyboardEvent, diameter: number): boolean {
        if (diameter >= DIAMETER_LIMIT) {
            return false;
        }
        return this.isNumber(event);
    }

    lengthValidator(event: KeyboardEvent, diameter: number): boolean {
        if (diameter >= LENGTH_LIMIT) {
            return false;
        }
        return this.isNumber(event);
    }
}
