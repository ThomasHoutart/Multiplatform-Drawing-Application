import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SERVER_LINK } from 'src/app/models/constant/drawing/constant';
import { Difficulty, WordImagePair } from 'src/app/models/interface/word-image-pair';
import { UserService } from '../user/user.service';

@Injectable({
    providedIn: 'root',
})
export class WordImagePairHandler {

  public wordImagePair : WordImagePair;
  private source = new BehaviorSubject('PARAMETERS');
  public currentWIPState = this.source.asObservable();
  public isCreatingNewPair: boolean;

  constructor(private http: HttpClient, private user: UserService) {
      this.isCreatingNewPair = false;
      this.wordImagePair = {
          hashSocketId: '',
          word: '',
          canvasSize: 0,
          paths: [],
          hints: [],
          difficulty: 'Easy' as Difficulty
      }
  }

  public initialWIPState(): void {
      this.isCreatingNewPair = false;
      this.source.next('PARAMETERS');
  }

  public changeWIPState(wordImagePairState: string): void {
      if (wordImagePairState === 'DRAWING' || wordImagePairState === 'PREVIEW') {
          this.isCreatingNewPair = true;
      }
      this.source.next(wordImagePairState);
  }

  public send(wordImagePair: WordImagePair): Observable<any> {
      const params = {
          hashSocketId: 'N/A',
          username: this.user.getUsername(),
          word: wordImagePair.word,
          canvasSize: JSON.stringify(wordImagePair.paths[0].canvasSize),
          hints:  JSON.stringify(wordImagePair.hints),
          difficulty: JSON.stringify(wordImagePair.difficulty),
          paths: JSON.stringify(wordImagePair.paths),
      };
      return this.http.post<WordImagePair>(SERVER_LINK + '/wordImagePair/', params);
  }
}
