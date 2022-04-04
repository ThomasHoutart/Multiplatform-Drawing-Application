import { ElementRef, Injectable } from '@angular/core';
import { KeyModifier } from 'src/interface/key-modifier';

@Injectable({
    providedIn: 'root',
})
export abstract class ToolHandler {

  static currentToolType: ToolHandler;

  elementRef: ElementRef;


  abstract handleMouseDown(event: MouseEvent, keyModifier?: KeyModifier): void;
  abstract handleMouseUp(event?: MouseEvent, keyModifier?: KeyModifier): void;
  abstract handleMouseMove(event: MouseEvent, keyModifier?: KeyModifier): void;
  abstract handleMouseLeave(): void;
  abstract handleDoubleClick(event: MouseEvent, keyModifier: KeyModifier): void;
  abstract handleMouseWheel(event: MouseEvent, keyModifier: KeyModifier): void;
  abstract handleDrawingLoad(): void;
  abstract handleShortcuts(keyModifier: KeyboardEvent): void;
  abstract storeAction(): ToolHandler;
  abstract handleUndo(): void;
  abstract handleRedo(): void;
  abstract handleCurrentToolChange(): void;
}
