import { AfterViewInit, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LeaveWIPComponent } from 'src/app/components/warning/leave-wip/leave-wip.component';
import { ServerErrorComponent } from 'src/app/components/warning/server-error/server-error.component';
import { WordImagePair } from 'src/app/models/interface/word-image-pair';
import { WordImagePairHandler } from 'src/app/services/word-image-pair-handler/word-image-pair-handler.service';

@Component({
    selector: 'app-word-image-pair-preview',
    templateUrl: './word-image-pair-preview.component.html',
    styleUrls: ['./word-image-pair-preview.component.css'],
})
export class WordImagePairPreviewComponent implements AfterViewInit {

  @Input() wordImagePair: WordImagePair;
  public sending: boolean;
  
  constructor(
    private wordImagePairHandler: WordImagePairHandler,
    public warning: MatDialog,
    public dialog: MatDialog,
  ) {
      this.sending = false;
  }

  ngAfterViewInit(): void {
      this.sending = false;
      return;
  }

  // eslint-disable-next-line max-lines-per-function
  public sendDrawing(): void {
      this.sending = true;
      this.wordImagePairHandler.send(this.wordImagePair).subscribe(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          (res: any) => {
              this.sending = false;
          },
          (error: any) => {
              this.sending = false;
              if (error.status != 200) {
                  this.displayErrorMsg();
              } else if (error.status == 200) {
                  this.wordImagePairHandler.initialWIPState();
              }
          }
      );
  }

  public displayErrorMsg(): void {
      this.warning.open(ServerErrorComponent);
  }

  onBack(): void {
      const dialogRef = this.dialog.open(LeaveWIPComponent);
      dialogRef.afterClosed().subscribe((isConfirmed) => {
          if (isConfirmed) {
              this.wordImagePairHandler.initialWIPState();
          }
      });
  }
}
