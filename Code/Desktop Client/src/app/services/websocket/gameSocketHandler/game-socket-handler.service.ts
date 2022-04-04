import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';
import { DrawingMessage } from 'src/app/models/interface/drawing-message';
import { GameInfo, Player } from 'src/app/models/interface/game';
@Injectable({
    providedIn: 'root'
})
export class GameSocketHandlerService {

  gameDrawingUpdate: Subject<DrawingMessage>;
  leaveGame: Subject<string>;
  startRound: Subject<string>;
  joinGameSpectator: Subject<GameInfo>;
  leaveGamePlayer: Subject<string>;
  endGame: Subject<string>;
  hint: Subject<string>;
  wordFound: Subject<string>;
  endRound: Subject<GameInfo>;
  gameThickCauseItsTHICCCCCC: Subject<number>;
  eliminated: Subject<string>;
  wordToDraw: Subject<string>;
  gameInfo: Subject<Player[]>

  constructor(private socket: Socket) {
      this.gameDrawingUpdate = new Subject<DrawingMessage>();
      this.leaveGame = new Subject<string>();
      this.startRound = new Subject<string>();
      this.joinGameSpectator = new Subject<GameInfo>();
      this.endGame = new Subject<string>();
      this.hint = new Subject<string>();
      this.wordFound = new Subject<string>();
      this.endRound = new Subject<GameInfo>();
      this.gameThickCauseItsTHICCCCCC = new Subject<number>();
      this.eliminated = new Subject<string>();
      this.wordToDraw = new Subject<string>();
      this.gameInfo = new Subject<Player[]>();
  }

  public userCheated(): void {
      this.socket.emit('UserCheated');
  }

  public leaveGameAsPlayer(): void {
      this.socket.emit('LeaveGamePlayer');
  }

  public leaveGameAsSpectator(): void {
      this.socket.emit('LeaveGameSpectator');
  }

  public askForHint(): void {
      this.socket.emit('Hint');
  }

  public joinGameAsSpectator(game: string): void {
      this.socket.emit('JoinGameSpectator', {gameName: game});
  }

  public onLeaveGameAsPlayer(): void {
      this.socket.on('LeaveGamePlayer', (gameInfo: GameInfo) => {
  		this.leaveGame.next(gameInfo.username);
  	});
  }

  public onLeaveGameAsSpectator(): void {
      this.socket.on('LeaveGameSpectator', (gameInfo: GameInfo) => {
  		this.leaveGame.next(gameInfo.username);
  	});
  }

  public onStartRound(): void {
      this.socket.on('StartRound', (gameInfo: GameInfo) => {
  		this.startRound.next(gameInfo.artist);
  	});
  }

  public onJoinGameSpectator(): void {
      this.socket.on('JoinGameSpectator', (gameInfo: GameInfo) => {
          this.joinGameSpectator.next(gameInfo);
      });
  }

  public onEndRound(): void {
      this.socket.on('EndRound', (gameInfo: GameInfo) => {
  		this.endRound.next(gameInfo);
  	});
  }

  public onEndGame(): void {
      this.socket.on('EndGame', (gameInfo: GameInfo) => {
  		this.endGame.next(gameInfo.gameName);
  	});
  }

  public onHint(): void {
      this.socket.on('Hint', (gameInfo: GameInfo) => {
  		this.hint.next(gameInfo.hint);
  	});
  }

  public onWordFound(): void {
      this.socket.on('WordFound', (gameInfo: GameInfo) => {
  		this.wordFound.next(gameInfo.username);
  	});
  }

  public onGameTick(): void {
      this.socket.on('GameTick', (gameInfo: GameInfo) => {
  		this.gameThickCauseItsTHICCCCCC.next(gameInfo.timeLeft);
  	});
  }

  public onEliminated(): void {
      this.socket.on('Eliminate', (gameInfo: GameInfo) => {
  		this.eliminated.next(gameInfo.username);
  	});
  }

  public onWordToDraw(): void {
      this.socket.on('WordToDraw', (gameInfo: GameInfo) => {
  		this.wordToDraw.next(gameInfo.word);
  	});
  }

  public onGameInfo(): void {
      this.socket.on('GameInfo', (playerlist: any) => {
          this.gameInfo.next(playerlist.scores);
      });
  }   

  public getGameInfo(): Observable<Player[]> {
      return this.gameInfo.asObservable()
  }

  public getWordToDrawUpdate(): Observable<string> {
      return this.wordToDraw.asObservable();
  }

  public getEliminatedUpdate(): Observable<string> {
      return this.eliminated.asObservable();
  }

  public getGameTickUpdate(): Observable<number> {
      return this.gameThickCauseItsTHICCCCCC.asObservable();
  }

  public getWordFoundUpdate(): Observable<string> {
      return this.wordFound.asObservable();
  }

  public getHintUpdate(): Observable<string> {
      return this.hint.asObservable();
  }

  public getEndGameUpdate(): Observable<string> {
      return this.endGame.asObservable();
  }

  public getEndRoundUpdate(): Observable<GameInfo> {
      return this.endRound.asObservable();
  }

  public getJoinGameSpectatorUpdate(): Observable<GameInfo> {
      return this.joinGameSpectator.asObservable();
  }

  public getStartRoundUpdate(): Observable<string> {
      return this.startRound.asObservable();
  }

  public getLeaveGameUpdate(): Observable<string> {
      return this.leaveGame.asObservable();
  }

  private leaveListeners(): void {
      this.onLeaveGameAsPlayer();
      this.onLeaveGameAsSpectator();
  }

  private wordListeners(): void {
      this.onWordFound();
      this.onWordToDraw();
      this.onHint();
  }

  private gameListeners(): void {
      this.onGameTick();
      this.onEndGame();
      this.onEndRound();
      this.onStartRound();
      this.onEliminated();
      this.onJoinGameSpectator();
      this.onGameInfo();
  }

  public listen(): void {
      this.leaveListeners();
      this.wordListeners();
      this.gameListeners();
  }

}
