import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameService } from 'src/app/services/game/game.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
    selector: 'app-info-bar',
    templateUrl: './info-bar.component.html',
    styleUrls: ['./info-bar.component.css']
})
export class InfoBarComponent implements OnInit, OnDestroy {

    public isDetective: boolean;
    public maxRoundNb: number;
    public timeLeft: number;
    public roundNb: number;
    public gameInfo: Subscription;

    constructor(public game: GameService, public user: UserService) { 
        this.initNewGameInfos();
    }

    private initNewGameInfos() {
        this.isDetective = !this.game.isUserDrawing;
        this.maxRoundNb = this.game.playersScore.length;
        this.roundNb = 1;
    }

    private updateGameInfos() {
        this.isDetective = !this.game.isUserDrawing;
        this.roundNb = this.game.gameInfo.roundNb
        this.timeLeft = this.game.gameInfo.timeLeft
    }

    private updateGameInfoListener(): void {
        this.gameInfo = this.game.getGameInfoUpdate().subscribe(() => {
            this.updateGameInfos();
            this.getWordArtist();
            this.getWordDetective();
        })
    }

    public getWordArtist(): string {
        console.log(this.user.status.isSpectator);

        return this.user.status.isSpectator ? '' : this.game.gameInfo.word;
    }

    public getWordDetective(): string {
        console.log(this.user.status.isSpectator);
        return 'Guess the Word';
    }

    private transformWord(word: string): string {
        let transformedWord = "";
        for (let i = 0; i < word.length; i++) {
            if(word[i] == " ") {
                transformedWord = transformedWord.concat(" ");
            } else {
                transformedWord = transformedWord.concat("_");
            }
        }
        return transformedWord;
    }

    ngOnInit(): void {
        this.updateGameInfoListener();
    }

    ngOnDestroy(): void {
        this.gameInfo.unsubscribe();
    }
}
