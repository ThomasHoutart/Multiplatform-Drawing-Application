/* eslint-disable max-lines-per-function */
import {
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
} 
    from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import {
    ChatMessage,
    ChatMessageDesktop,
} from 'src/app/models/interface/chat-message-desktop';
import { GameInfo, UserInGame } from 'src/app/models/interface/game';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { GameService } from 'src/app/services/game/game.service';
import { RoomService } from 'src/app/services/room/room.service';
import { UserService } from 'src/app/services/user/user.service';
import { State } from 'src/interface/section/section';
import { EndGameDialogComponent } from './end-game-dialog/end-game-dialog.component';
import { StartGameDialogComponent } from '../start-game-dialog/start-game-dialog.component';
import { EndRoundDialogComponent } from './end-round-dialog/end-round-dialog.component';
import { WAITING_FOR_WORD } from './info-bar/constant';
import { SoundsService } from 'src/app/services/sounds/sounds.service';
import { AntiCheatService } from 'src/app/services/anti-cheat/anti-cheat.service';
import { LobbyService } from 'src/app/services/lobby/lobby.service';
import { MenuService } from 'src/app/services/menu/menu.service';

@Component({
    selector: 'app-game-view',
    templateUrl: './game-view.component.html',
    styleUrls: ['./game-view.component.css'],
})
export class GameViewComponent implements OnInit, OnDestroy {

    @Output()
    onBack: EventEmitter<any> = new EventEmitter<any>();
 
    public isDetective = true;
    public mode: string;
    public leaveGame: Subscription;
    public startRound: Subscription;
    public endRound: Subscription;
    public endGame: Subscription;
    public hint: Subscription;
    public wordFound: Subscription;
    public gameTick: Subscription;
    public wordToDraw: Subscription;
    public eliminated: Subscription;
    public squareSize: any;
    public isEliminated: boolean;
    public gameInfo: Subscription;
    public foundTheWord: boolean;

    constructor(
        public endRoundPopup: MatDialogRef<EndRoundDialogComponent>,
        public startGamePopup: MatDialogRef<StartGameDialogComponent>,
        public dialog: MatDialog,
        public game: GameService,
        private sounds: SoundsService,
        private drawing: DrawingService,
        private user: UserService,
        private room: RoomService,
        private anticheat: AntiCheatService,
        private lobby: LobbyService,
        private menu: MenuService
    ) {
        this.mode = "artist";
        this.game.isGame = true;
        this.game.isUserDrawing = true;
        this.isEliminated = false;
        this.foundTheWord = false;
        this.initNewGameInfos();
    }

    private initNewGameInfos() {
        this.isDetective = !this.game.isUserDrawing;
    }

    public getWordArtist(): string {
        return this.game.gameInfo.word;
    }

    private updateGameInfos() {
        this.isDetective = !this.game.isUserDrawing;
    }

    private updateGameInfoListener(): void {
        this.gameInfo = this.game.getGameInfoUpdate().subscribe(() => {
            this.updateGameInfos();
            this.getWordArtist();
        })
    }
    public openStartGamePopUp(): void {
        this.startGamePopup = this.dialog.open(StartGameDialogComponent, {
            hasBackdrop: false,
        })
    }

    public closeAllDialog(): void {
        this.closeEndRoundPopUp();
        this.closeStartGamePopUp();
    }

    public closeStartGamePopUp(): void {
        try {
            this.startGamePopup.close();
        } catch (e) {
            return;
        }
    }
    private sortByPointsVar(): UserInGame[] {
        let temp =  this.game.playersScore;
        temp = temp.sort((p2, p1) => {
            return (p1.scoreVarFromLastRound - p2.scoreVarFromLastRound);
        });
        return temp;
    }
    
    public openEndRoundPopUp(): void {
        this.endRoundPopup = this.dialog.open(EndRoundDialogComponent, {
            data: {
                roundNb: this.game.gameInfo.roundNb,
                playerScoreUpdate: this.sortByPointsVar(),
                title: this.endRoundTitle(),
            },
            hasBackdrop: false,
            panelClass: 'noPadding-dialog-container',
        });
    }

    public endRoundTitle(): string {
        if (this.game.gameInfo.gameMode === 'BR') {
            if (this.isEliminated === false || (this.isEliminated === true && this.user.status.isSpectator === false)) {
                return this.isEliminated ? "You're out!" : "You're still in!";
            }
        }
        return 'End of round';
    }

    private getFinalPosition(): number{
        this.placementUpdate();
        return (this.game.playersScore.find(e => e.username == this.user.getUsername())).placementPosition;
    }

    private placementUpdate(): void {
        for (let i = 0; i < this.game.playersScore.length; i++) {
            let rank = 1;
            for (let j = 0; j < this.game.playersScore.length; j++) {
                if (this.game.playersScore[j].score > this.game.playersScore[i].score) rank++;
            }
            this.game.playersScore[i].placementPosition = rank;
        }
    }
  

    public getFinalPositionMessage(): string {
        if(this.user.status.isSpectator) {
            return "Game Over";
        }
        else if(this.getFinalPosition()==1) {
            return "YOU WON!!!";
        }
        else if(this.getFinalPosition()==2) {
            return "You finished 2nd!";
        }
        else if(this.getFinalPosition()==3) {
            return "You finished 3rd!";
        }
        else if(this.getFinalPosition()==4) {
            return "You finished 4th!";
        }
        else if(this.getFinalPosition()==5) {
            return "You finished 5th!";
        }
        else if(this.getFinalPosition()==6) {
            return "You finished 6th!";
        }
        else if(this.getFinalPosition()==7) {
            return "You finished 7th!";
        }
        else if(this.getFinalPosition()==8) {
            return "You finished 8th!";
        }
        
    }

    public sentenceForNonArtist(): string {
        return this.user.status.isSpectator ? 'Enjoy the Show' : 'Guess the Word';
    }

    public leaveGamePage(): void {
        this.sounds.playGameEndAudio();
        const dialogRef = this.dialog.open(EndGameDialogComponent, {
            data: {
                roundNb: this.game.gameInfo.roundNb,
                playerScoreUpdate: this.game.playersScore,
                finalPosition: this.getFinalPositionMessage()
            },
            panelClass: 'noPadding-dialog-container',
            hasBackdrop: true,
            disableClose: true
        });
        dialogRef.disableClose = true;

        dialogRef.afterClosed().subscribe((isConfirmed) => {
            console.log(isConfirmed);
            if (isConfirmed) {
                this.user.status.isSpectator = false;
                this.menu.updateBarMenu(false);
                this.onBack.emit(State.GameCreationView);
            }
        });
    }

    public closeEndRoundPopUp(): void {
        try {
            this.endRoundPopup.close();
        } catch (e) {
            return;
        }
    }

    public changeMode(mode: string): void {
        this.mode = mode;
        this.game.isUserDrawing = mode === 'artist' ? true : false;
        if (mode === 'detective') {
            this.drawing.resetDrawing();
            this.drawing.sendDrawingUpdate();
        }
    }

    public leaveGameListener(): void {
        this.leaveGame = this.game.leaveGameListener().subscribe((username: string) => {
            if (this.user.getUsername() === username) {
                this.menu.updateBarMenu(false);
                this.onBack.emit(State.GameCreationView);
            }
        })
    }

    public startRoundListener(): void {
        this.startRound = this.game.startRoundListener().subscribe((artist: string) => {
            this.foundTheWord = false;
            this.sounds.playRoundStartAudio();
            this.anticheat.chatIsBlocked = false;
            this.closeAllDialog();
            this.game.drawingElements = [];
            this.game.sendServerUpdateDrawing();
            this.game.incrementRound();
            if (this.user.getUsername() === artist) {
                this.game.isUserDrawing = true;
            } else {
                this.game.isUserDrawing = false;
            }
            this.game.sendGameInfo();
        });
    }

    public endRoundListener(): void {
        this.endRound = this.game.endRoundListener().subscribe((info: GameInfo) => {
            this.wordtoFoundWas(info.word);
            this.closeAllDialog();
            this.game.isUserDrawing = false;
            if (this.game.playersScore.length === 0) {
                this.game.initializeScore(info.scores);
            } else {
                this.game.updateScore(info.scores);
            }
            this.game.sendUserScoreUpdate();
            //this.game.gameInfo.timeLeft = null;
            this.game.sendGameInfo();
            this.game.gameInfo.word = WAITING_FOR_WORD;
            this.openEndRoundPopUp();
            if (this.isEliminated) {
                this.user.status.isSpectator = true;
            }
        });
    }

    public endGameListener(): void {
        this.endGame = this.game.endGameListener().subscribe((gameName: string) => {
            if (this.game.gameInfo.gameName === gameName) {
                this.lobby.kickFromServer = false;
                this.closeAllDialog();
                this.leaveGamePage();
            }
        })
    }

    public hintListener(): void {
        this.hint = this.game.hintListener().subscribe((hint: string) => {
            console.log(hint);
        });
    }

    public wordtoFoundWas(word: string): void {
        const message: ChatMessageDesktop = {
            chatMessage: {
                content: word,
                author: 'system',
                timestamp: '',
                roomName: this.room.currentRoom
            } as ChatMessage,
            type: 4
        }
        this.room.addMessage(message);
    }

    public wordFoundListener(): void {
        this.wordFound = this.game.wordFoundListener().subscribe((username: string) => {
            this.sounds.playWordFoundAudio();
            const message: ChatMessageDesktop = {
                chatMessage: {
                    content: (this.user.getUsername() === username ? 'you' : username) + ' found the word',
                    author: 'system',
                    timestamp: '',
                    roomName: this.room.currentRoom
                } as ChatMessage,
                type: 3
            }
            this.room.addMessage(message);
            this.foundTheWord = true;
            if (this.user.getUsername() === username) {return}
        });
    }

    public gameTickListener(): void {
        this.gameTick = this.game.gameTickListener().subscribe((timeLeft: number) => {
            this.game.gameInfo.timeLeft = timeLeft;
            this.game.sendGameInfo();
        })
    }

    public wordToDrawListener(): void {
        this.wordToDraw = this.game.wordToDrawListener().subscribe((word: string) => {
            this.game.gameInfo.word = word;
            this.game.sendGameInfo();
        })
    }

    public elimininatedListener(): void {
        this.eliminated = this.game.eliminatedListener().subscribe((username: string) => {
            if (this.user.getUsername() === username) {
                this.isEliminated = true;
            }
        });
    }

    public listen(): void {
        this.leaveGameListener();
        this.startRoundListener();
        this.endRoundListener();
        this.endGameListener();
        this.wordFoundListener();
        this.gameTickListener();
        this.wordToDrawListener();
        this.openStartGamePopUp();
        this.elimininatedListener();
        this.updateGameInfoListener();
        this.hintListener();
    }

    public terminate(): void {
        this.leaveGame.unsubscribe();
        this.startRound.unsubscribe();
        this.endRound.unsubscribe();
        this.endGame.unsubscribe();
        this.hint.unsubscribe();
        this.wordFound.unsubscribe();
        this.gameTick.unsubscribe();
        this.wordToDraw.unsubscribe();
        this.eliminated.unsubscribe();
        this.gameInfo.unsubscribe();
    }

    public ngOnInit(): void {
        this.game.isUserDrawing = false;
        this.listen();
        this.closeAllDialog();
        this.anticheat.reset();
        this.lobby.kickFromServer = false;
    }

    public ngOnDestroy(): void {
        this.terminate();
        this.closeAllDialog();
    }
}