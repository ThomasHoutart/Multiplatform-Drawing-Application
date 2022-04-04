import {
    Component,
    EventEmitter,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    Difficulty,
    WordImagePairInfo,
} from 'src/app/models/interface/word-image-pair';
import { GameService } from 'src/app/services/game/game.service';
import { WordImagePairHandler } from 'src/app/services/word-image-pair-handler/word-image-pair-handler.service';
import { NORMAL } from '../../gamemode/game-creation/constant';
import { HintListComponent } from '../hint-list/hint-list.component';

@Component({
    selector: 'app-word-image-pair-parameters',
    templateUrl: './word-image-pair-parameters.component.html',
    styleUrls: ['./word-image-pair-parameters.component.css'],
})
export class WordImagePairParametersComponent implements OnInit {

  public form: FormGroup;
  public difficulty: string;
  @Output() sendInfo = new EventEmitter<WordImagePairInfo>();
  @ViewChild('hintList') hintList: HintListComponent;

  constructor(
    private formBuilder: FormBuilder,
    private wordImagePairHandler: WordImagePairHandler,
    public gameService: GameService
  ) {
      this.difficulty = NORMAL
  }

  ngOnInit(): void {
      this.form = this.formBuilder.group({
          word: ['', [Validators.required, Validators.minLength(3)]],
      });

  }

  onDifficultyChange(difficulty: string): void {
      this.difficulty = difficulty;
      this.wordImagePairHandler.wordImagePair.difficulty = difficulty as Difficulty;
  }

  public continue(): void {
      //send info
      this.wordImagePairHandler.wordImagePair.word = this.form.value.word;
      const wordImagePairInfo: WordImagePairInfo = {
          word: this.form.value.word,
          hints: this.hintList.getHints(),
          canvasSize: this.gameService.drawingSurfaceSize,
          difficulty: this.difficulty as Difficulty,
      };
      this.sendInfo.next(wordImagePairInfo);
      this.wordImagePairHandler.changeWIPState('DRAWING');
  }
}
