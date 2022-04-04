import { TestBed } from '@angular/core/testing';
import { KeyModifier } from 'src/interface/key-modifier';
import { ToolHandler } from './tool-handler.service';

export class MockToolHandler extends ToolHandler {
  // tslint:disable-next-line: no-empty
  handleMouseDown(event: MouseEvent, keyModifier?: KeyModifier) { }
  // tslint:disable-next-line: no-empty
  handleMouseUp(event?: MouseEvent, keyModifier?: KeyModifier) { }
  // tslint:disable-next-line: no-empty
  handleMouseMove(event: MouseEvent, keyModifier?: KeyModifier) { }
  // tslint:disable-next-line: no-empty
  handleMouseLeave() { }
  // tslint:disable-next-line: no-empty
  handleDoubleClick(event: MouseEvent, keyModifier: KeyModifier) { }
  // tslint:disable-next-line: no-empty
  handleMouseWheel(event: MouseEvent, keyModifier: KeyModifier) { }
  // tslint:disable-next-line: no-empty
  handleUndo() { }
  // tslint:disable-next-line: no-empty
  handleRedo() { }
  // tslint:disable-next-line: no-empty
  handleDrawingLoad() { }
  // tslint:disable-next-line: no-empty
  handleShortcuts(event: KeyboardEvent) { }
  // tslint:disable-next-line: no-empty
  storeAction() { return new MockToolHandler(); }
  // tslint:disable-next-line: no-empty
  handleCurrentToolChange() { }
}

describe('ToolHandlerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
  });
});
