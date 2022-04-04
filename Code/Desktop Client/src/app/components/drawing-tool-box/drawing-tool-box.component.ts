/* eslint-disable max-lines-per-function */
import { Component, OnInit } from '@angular/core';
import { PencilToolHandlerService } from 'src/app/services/tool-handler/trace/pencil/pencil-tool-handler.service';
import { GridService } from 'src/app/services/tool/grid/grid.service';
import { ToolService } from 'src/app/services/tool/tool.service';
import { DEFAULT_GRID_PARAM, DEFAULT_PATH_PARAM } from 'src/app/models/constant/drawing/constant';
import { PathConverterService } from 'src/app/services/path-converter/path-converter.service';
import { EraserToolHandlerService } from 'src/app/services/tool-handler/eraser/eraser-tool-handler.service';

@Component({
    selector: 'app-drawing-tool-box',
    templateUrl: './drawing-tool-box.component.html',
    styleUrls: ['./drawing-tool-box.component.css']
})

export class DrawingToolBoxComponent implements OnInit {

  public pencilSelected;
  public cellSize;
  public strokeWidth;
  public opacity;
  public colorPickerIsOpen = false;
  public color;
  public toggleGridSelected;
  constructor(
    private pencil: PencilToolHandlerService,
    private eraser: EraserToolHandlerService,
    private tool: ToolService,
    private grid: GridService,
    private converter: PathConverterService) {
      this.pencilSelected = true;
      this.cellSize = DEFAULT_GRID_PARAM.size;
      this.strokeWidth = DEFAULT_PATH_PARAM.thickness;
      this.opacity = DEFAULT_GRID_PARAM.opacity * 100;
      this.toggleGridSelected = false;
  }

  colorPickerConverter(event: string): string[] {
      let string1: string = event.substr(4);
      string1 = string1.replace('(', '');
      string1 = string1.replace(')', '');
      return string1.split(',')
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  updateOpacity(event): void {
      this.opacity = event.value;
      this.grid.gridParam.opacity = this.opacity / 100;
      this.grid.sendGridUpdate();
  }

  convertArrayToRGB(array: string[]): string {
      return '#' + this.converter.rgbToHex(array[0]) +
      this.converter.rgbToHex(array[1]) +
      this.converter.rgbToHex(array[2]);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  updateColor(event): void {
      const colorArray: string[] = this.colorPickerConverter(event);
      this.color = this.convertArrayToRGB(colorArray);
      if (colorArray.length == 4) {
          this.pencil.currentPathParam.opacity = parseFloat(colorArray[3]);
      } else {
          this.opacity = 100;
          this.pencil.currentPathParam.opacity = this.opacity / 100
      }
      this.pencil.currentPathParam.color = this.color;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  updateStrokeWidth(event): void {
      this.strokeWidth = event.value;
      this.pencil.currentPathParam.thickness = this.strokeWidth;
      this.eraser.sendUpdateEraserSize(this.strokeWidth);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  updateCellSize(event): void {
      this.cellSize = event.value;
      this.grid.gridParam.size = this.cellSize;
      this.grid.sendGridUpdate();
  }

  changeTool(isPencil: boolean): void {
      this.tool.setTool(isPencil);

      this.pencilSelected = isPencil
  }

  toggleGrid(): void {
      this.toggleGridSelected = !this.toggleGridSelected;
      this.grid.sendGridState();
  }

  changeColorPickerState(): void {
      this.colorPickerIsOpen = !this.colorPickerIsOpen;
  }

  ngOnInit(): void {
      this.eraser.sendUpdateEraserSize(this.strokeWidth);
  }
}
