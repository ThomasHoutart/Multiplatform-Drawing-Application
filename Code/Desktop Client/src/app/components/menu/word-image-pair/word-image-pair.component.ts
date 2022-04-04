import { Component, OnInit } from '@angular/core';
import { DrawingMessage } from 'src/app/models/interface/drawing-message';
import { WordImagePair, WordImagePairInfo } from 'src/app/models/interface/word-image-pair';
import { WordImagePairHandler } from 'src/app/services/word-image-pair-handler/word-image-pair-handler.service';
import { Section } from 'src/interface/section/section';

@Component({
    selector: 'app-word-image-pair',
    templateUrl: './word-image-pair.component.html',
    styleUrls: ['./word-image-pair.component.css']
})
export class WordImagePairComponent implements OnInit {
  public section: Section;
  public sectionParameters: boolean;
  public sectionDrawing: boolean;
  public sectionPreview: boolean;

  public wordImagePair: WordImagePair;

  constructor(private wordImagePairHandler: WordImagePairHandler) {
  	this.listenerToWordImagePairState();
  }

  ngOnInit(): void {
      this.wordImagePairHandler.initialWIPState();
  }

  public listenerToWordImagePairState(): void{
  	this.wordImagePairHandler.currentWIPState.subscribe(wordImagePairState => {
  		this.navToSection(wordImagePairState);
  	});
  }

  public navToSection(section: string): void {
  	this.sectionParameters = false;
  	this.sectionDrawing = false;
  	this.sectionPreview = false;
  	if (section === 'PREVIEW') { this.sectionPreview = true; }
  	if (section === 'DRAWING') { this.sectionDrawing = true; }
  	if (section === 'PARAMETERS') { this.sectionParameters = true; }
  }

  public onDrawingSubmit(drawing: DrawingMessage[]): void {
      this.wordImagePair.paths = drawing;
  }

  public onInfoSubmit(info: WordImagePairInfo): void {
      this.wordImagePair = info as WordImagePair;
  }
}
