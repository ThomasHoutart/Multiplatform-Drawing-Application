import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { DrawingMessage } from 'src/app/models/interface/drawing-message';
import { PathConverterService } from 'src/app/services/path-converter/path-converter.service';
type Index = {
  element: number;
  coord: number;
};

@Component({
    selector: 'app-preview',
    templateUrl: './preview.component.html',
    styleUrls: ['./preview.component.css'],
})
export class PreviewComponent implements AfterViewInit, OnDestroy {
  @Input() drawing: DrawingMessage[] = [];
  public displayedElements: DrawingMessage[] = [];
  public coordinateMatrix: string[][] = [];
  public lastDisplayedIndex: Index;
  public interval;
  public isIntervalPaused = false;
  public canvasSize: number;
  public initCounter: number;


  @ViewChild('drawingSurface') targetElement: ElementRef;
  constructor(public pathConverter: PathConverterService) {
      this.initCounter = 0;
  }

  ngAfterViewInit(): void {
      this.lastDisplayedIndex = { element: 0, coord: 0 };
      this.initCounter += 1;
      if (this.initCounter > 0) {
          this.modifySizeDrawingSurface();
          this.displayDrawing();
      }
  }

  displayDrawing(): void {
      this.drawing.forEach((element) => {
          element.strokeWidth = element.strokeWidth * element.canvasSize / this.canvasSize;
          const desktopPath = this.pathConverter.convertPathServerToDesktopPath(element, this.canvasSize);
          const segmentedPath: string[] = this.pathConverter.segmentDesktopPath(desktopPath);
          this.coordinateMatrix.push(segmentedPath);
      });
      this.interval = setInterval(() => this.displayElement(), 10);
  }

  ngOnDestroy(): void {
      clearInterval(this.interval);
  }

  displayElement(): void {
      if (!this.isIntervalPaused) {
          const index = this.lastDisplayedIndex;
          const isDrawingComplete = this.coordinateMatrix.length === index.element;
          if (isDrawingComplete) {
              this.triggerAnimationPause();
          } else {
              const isElementComplete =
          this.coordinateMatrix[index.element].length === index.coord;
              if (isElementComplete) this.goToNextElement();
              else this.drawCurrentElementCoord();
          }
      }
  }

  public drawCurrentElementCoord(): void {
      const index = this.lastDisplayedIndex;
      const coordsToDisplay = this.coordinateMatrix[index.element][index.coord];
      if (index.coord == 0) {
          const element = this.drawing[index.element];
          this.displayedElements.push({ ...element, path: coordsToDisplay });
      } else {
          this.displayedElements[index.element].path += coordsToDisplay;
      }
      index.coord += 1;
  }

  public goToNextElement(): void {
      this.lastDisplayedIndex.element += 1;
      this.lastDisplayedIndex.coord = 0;
  }

  public triggerAnimationPause(): void {
      this.isIntervalPaused = true;
      setTimeout(() => {
          this.lastDisplayedIndex.element = 0;
          this.lastDisplayedIndex.coord = 0;
          this.displayedElements = [];
          this.isIntervalPaused = false;
      }, 1000);
  }

  public modifySizeDrawingSurface(): void {
      const drawingSurface = this.targetElement.nativeElement;
      const height = this.targetElement.nativeElement.offsetHeight;
      const width = this.targetElement.nativeElement.offsetWidth;
      const size: number = width < height ? width : height;
      this.canvasSize = size;
      drawingSurface.style.height = size + 'px';
      drawingSurface.style.width = size + 'px';
  }
}
