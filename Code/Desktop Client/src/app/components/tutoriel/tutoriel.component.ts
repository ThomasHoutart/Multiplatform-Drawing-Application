import { HostListener } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NB_OF_PAGES } from './constant';

@Component({
    selector: 'app-tutoriel',
    templateUrl: './tutoriel.component.html',
    styleUrls: ['./tutoriel.component.css']
})
export class TutorielComponent implements OnInit {

  public index: number;

  @HostListener("click", ["$event"])
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public onClick(event: any): void
  {
      event.stopPropagation();
  }

  constructor() {
      this.index = 0;
  }

  skipTuto():void {
      this.index = 6;
  }
  
  onPrevious(): void {
      if (this.index > 0) {
          this.index -= 1;
      }
  }

  onNext(): void {
      if (this.index + 1 < NB_OF_PAGES) {
          this.index += 1;
      }
  }

  canNext(): boolean {
      return this.index + 1 < NB_OF_PAGES;
  }

  canPrevious(): boolean {
      return this.index > 0;
  }

  ngOnInit(): void {
      return;
  }

}
