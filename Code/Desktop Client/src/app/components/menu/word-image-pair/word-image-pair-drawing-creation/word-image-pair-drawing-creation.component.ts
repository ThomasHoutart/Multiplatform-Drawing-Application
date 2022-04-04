import {
    AfterViewChecked,
    Component,
    EventEmitter,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LeaveWIPComponent } from 'src/app/components/warning/leave-wip/leave-wip.component';
import { LoadingComponent } from 'src/app/components/warning/loading/loading.component';
import { DrawingMessage } from 'src/app/models/interface/drawing-message';
import { GameService } from 'src/app/services/game/game.service';
import { PathConverterService } from 'src/app/services/path-converter/path-converter.service';
import { WordImagePairHandler } from 'src/app/services/word-image-pair-handler/word-image-pair-handler.service';
import { Path } from 'src/interface/trace/pencil';

@Component({
    selector: 'app-word-image-pair-drawing-creation',
    templateUrl: './word-image-pair-drawing-creation.component.html',
    styleUrls: ['./word-image-pair-drawing-creation.component.css'],
})
export class WordImagePairDrawingCreationComponent implements OnInit, AfterViewChecked {
  @ViewChild('drawingSurface') drawingSurface;
  @Output() sendDrawing = new EventEmitter<DrawingMessage[]>();

  viewInitCounter: number
  dialogRef: MatDialogRef<LoadingComponent>;

  constructor(
    public wordImagePairHandler: WordImagePairHandler,
    public pathConverter: PathConverterService,
    public dialog: MatDialog,
    public game: GameService,
  ) {
      this.viewInitCounter = 0;
  }

  ngOnInit(): void {
      this.dialogRef = this.dialog.open(LoadingComponent, {
          hasBackdrop: true,
          disableClose: true,
      })
  }

  ngAfterViewChecked(): void {
      this.viewInitCounter += 1;
      if (this.viewInitCounter > 2) {
          this.dialogRef.close();
      }
  }

  back(): void {
      const dialogRef = this.dialog.open(LeaveWIPComponent);
      dialogRef.afterClosed().subscribe((isConfirmed) => {
          if (isConfirmed) {
              this.wordImagePairHandler.initialWIPState();
          }
      });
  }

  public continue(): void {
      const serverFormat: DrawingMessage[] = [];
      this.drawingSurface.elements.forEach((path: Path) => {
          const coord = this.pathConverter.convertDesktopPathToServerPath(path.path);
          serverFormat.push({
              pathId: path.uniqueId,
              color: path.color,
              strokeWidth: path.thickness,
              path: coord,
              canvasSize: this.game.drawingSurfaceSize,
          });
      });
      this.sendDrawing.emit(serverFormat);
      this.wordImagePairHandler.changeWIPState('PREVIEW');
  }
}
