import { ChangeDetectorRef } from '@angular/core';
import {
    AfterViewChecked,
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { EMPTY_PATH } from 'src/app/models/constant/drawing/constant';
import { DrawingMessage } from 'src/app/models/interface/drawing-message';
import { GridElement, GridParam } from 'src/app/models/interface/grid-element';
import { ActionService } from 'src/app/services/actions/action.service';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { GameService } from 'src/app/services/game/game.service';
import { KeypressService } from 'src/app/services/keypress/keypress.service';
import { EraserToolHandlerService } from 'src/app/services/tool-handler/eraser/eraser-tool-handler.service';
import { ToolHandler } from 'src/app/services/tool-handler/tool-handler.service';
import { PencilToolHandlerService } from 'src/app/services/tool-handler/trace/pencil/pencil-tool-handler.service';
import { GridService } from 'src/app/services/tool/grid/grid.service';
import { ToolService } from 'src/app/services/tool/tool.service';
import { LEFT_KEY, RIGHT_KEY } from 'src/constant/toolbar/constant';
import { KeyModifier } from 'src/interface/key-modifier';
import { Point } from 'src/interface/Point';
import { Path } from 'src/interface/trace/pencil';

@Component({
    selector: 'app-drawing-surface',
    templateUrl: './drawing-surface.component.html',
    styleUrls: ['./drawing-surface.component.css'],
})
export class DrawingSurfaceComponent
implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  @HostListener('contextmenu', ['$event']) disableRightClick(event: Event): void {
        event.preventDefault();
    }

  @HostListener('mousedown', ['$event']) mouseDownListener(event: MouseEvent): void {
      this.isMouseDown = true;
      const keyModifier: KeyModifier = this.generateKeyModifierObject(event);
      if (!this.game.isGame || this.game.isUserDrawing) {
          this.toolHandler.handleMouseDown(event, keyModifier);
      }
  }

  @HostListener('mousemove', ['$event']) mouseMoveListener(event: MouseEvent): void {
      const keyModifier: KeyModifier = this.generateKeyModifierObject(event);
      if (!this.game.isGame || this.game.isUserDrawing) {
          this.toolHandler.handleMouseMove(event, keyModifier);
      }
  }

  @HostListener('mouseup', ['$event']) mouseUpListener(event: MouseEvent): void {
      this.isMouseDown = false;
      const keyModifier: KeyModifier = this.generateKeyModifierObject(event);
      if (!this.game.isGame || this.game.isUserDrawing) {
          this.toolHandler.handleMouseUp(event, keyModifier);
      }
  }

  @HostListener('mouseleave', ['$event']) mouseLeaveListener(): void {
      this.isMouseDown = false;
      if (!this.game.isGame || this.game.isUserDrawing) {
          this.toolHandler.handleMouseLeave();
      }
  }

  @HostListener('document:keydown', ['$event']) keypressListener(
      $event: KeyboardEvent
  ): void {
      if (!this.game.isGame || this.game.isUserDrawing) {
          if (!this.isMouseDown) {
              if (KeypressService.isCtrlShiftZ($event)) {
                  this.action.redoAction();
              } else if (KeypressService.isCtrlZ($event)) {
                  this.action.undoAction();
              }
          }
      }
  }

  elements: Path[];
  eraserCoordinate: Point;
  eraserSize: number;
  drawingListener: Subscription;
  actionListener: Subscription;
  toolListener: Subscription;
  eraserListener: Subscription;
  eraserSizeUpdate: Subscription;
  gridParamListener: Subscription;
  gridStateListener: Subscription;
  serverDrawingListener: Subscription;
  setPath: Subscription;
  updatePath: Subscription;
  selectedElement: Path;
  isGridOn: boolean;
  isMouseDown: boolean;
  currentGrid: GridElement;
  gridParam: GridParam;
  gridPath: string;
  viewInitDone: boolean;
  viewInitCounter: number;

  // eslint-disable-next-line max-lines-per-function
  @ViewChild('drawingSurface') targetElement: ElementRef;
  // eslint-disable-next-line max-lines-per-function
  constructor(
    public toolHandler: ToolHandler,
    public pencilService: PencilToolHandlerService,
    public eraserService: EraserToolHandlerService,
    public drawing: DrawingService,
    public tool: ToolService,
    public grid: GridService,
    public action: ActionService,
    private ref: ChangeDetectorRef,
    public game: GameService
  ) {
      this.elements = [];
      this.eraserCoordinate = { x: 0, y: 0 };
      this.eraserSize = 50;
      this.selectedElement = EMPTY_PATH;
      this.isGridOn = false;
      this.isMouseDown = false;
      this.gridPath = '';
      this.viewInitDone = false;
      this.viewInitCounter = 0;
  }

  generateGrid(): void {
      this.grid.generateGridElement(4000, 4000);
  }

  onElement(element: Path): void {
      this.selectedElement = element;
      this.eraserService.SelectedElement = element;
  }

  offElement(): void {
      this.selectedElement = EMPTY_PATH;
      this.eraserService.SelectedElement = EMPTY_PATH;
  }

  generateKeyModifierObject(event: MouseEvent): KeyModifier {
      return {
          shift: event.shiftKey,
          leftKey: event.button === LEFT_KEY,
          rightKey: event.button === RIGHT_KEY,
          altKey: event.altKey,
      };
  }

  setDrawingListener(): void {
      this.drawingListener = this.drawing
          .getDrawingUpdate()
          .subscribe((path: Path[]) => {
              this.elements = path;
          });
  }

  setActionListener(): void {
      this.actionListener = this.drawing
          .getActionUpdate()
          .subscribe((path: Path[]) => {
              this.action.addAction(path);
          });
  }

  setToolChangeListener(): void {
      this.toolListener = this.tool
          .changeTool()
          .subscribe((isPencil: boolean) => {
              this.setTool(isPencil ? this.pencilService : this.eraserService);
              this.eraserService.SelectedElement = EMPTY_PATH;
          });
  }

  setEraserCoordinateListener(): void {
      this.eraserListener = this.eraserService
          .getEraserCoordinate()
          .subscribe((coordinate: Point) => {
              this.eraserCoordinate = coordinate;
          });
  }

  setGridParamListener(): void {
      this.gridParamListener = this.grid.getGridUpdate().subscribe(() => {
          this.gridParam = this.grid.gridParam;
          this.gridPath = this.grid.generateGridElement(4000, 4000);
      });
  }

  setGameDrawingUpdateListener(): void {
      this.serverDrawingListener = this.game
          .getServerUpdateDrawing()
          .subscribe((drawing: Path[]) => {
              this.elements = drawing;
          });
  }

  setGridState(): void {
      this.gridStateListener = this.grid.getGridState().subscribe(() => {
          this.isGridOn = !this.isGridOn;
      });
  }

  setPathListener(): void {
      this.setPath = this.game
          .setPathListener()
          .subscribe((drawingMessage: DrawingMessage) => {
              this.game.setDrawingLogic(drawingMessage);
          });
  }

  updatePathListener(): void {
      this.updatePath = this.game
          .appendPathListener()
          .subscribe((point: Point) => {
              this.game.updateDrawingLogic(point);
          });
  }

  updateEraserSize(): void {
      this.eraserSizeUpdate = this.eraserService.getEraserSizeUpdate().subscribe((size: number) => {
          this.eraserSize = size;
      })
  }

  listen(): void {
      this.setDrawingListener();
      this.setActionListener();
      this.setToolChangeListener();
      this.setEraserCoordinateListener();
      this.setGridParamListener();
      this.setGridState();
      this.setGameDrawingUpdateListener();
      this.setPathListener();
      this.updatePathListener();
      this.updateEraserSize();
  }

  remove(): void {
      this.drawingListener.unsubscribe();
      this.actionListener.unsubscribe();
      this.toolListener.unsubscribe();
      this.eraserListener.unsubscribe();
      this.gridParamListener.unsubscribe();
      this.gridStateListener.unsubscribe();
      this.setPath.unsubscribe();
      this.updatePath.unsubscribe();
      this.serverDrawingListener.unsubscribe();
      this.eraserSizeUpdate.unsubscribe();
  }

  setTool(tool: ToolHandler): void {
      ToolHandler.currentToolType = tool;
      this.toolHandler = ToolHandler.currentToolType;
  }

  public modifySizeDrawingSurface(): void {
      const drawingSurface = this.targetElement.nativeElement;
      const height = this.targetElement.nativeElement.offsetHeight;
      const width = this.targetElement.nativeElement.offsetWidth;
      const size: number = width < height ? width : height;
      this.game.drawingSurfaceSize = size;
      drawingSurface.style.height = size + 'px';
      drawingSurface.style.width = size + 'px';
  }

  ngOnInit(): void {
      this.setTool(this.pencilService);
      this.generateGrid();
      this.listen();
  }

  ngOnDestroy(): void {
      this.remove();
      this.drawing.resetDrawing();
      this.action.clearActions();
  }

  ngAfterViewInit(): void {
      this.grid.sendGridUpdate();
      this.ref.detectChanges();
  }

  ngAfterViewChecked(): void {
      this.viewInitCounter += 1;
      if (this.viewInitCounter > 1 && !this.viewInitDone) {
          this.modifySizeDrawingSurface();
          this.viewInitDone = true;
      }
  }
}
