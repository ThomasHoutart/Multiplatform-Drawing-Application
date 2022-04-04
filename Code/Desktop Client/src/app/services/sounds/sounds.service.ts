import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SoundsService {

    playAudio(audioSource: string): void {
        const audio = new Audio(audioSource);
        audio.load();
        audio.play();
    }

    public playWinAudio(): void {
        this.playAudio("assets/audio/alarm.wav");
    }

    public playLogInSound(): void {
        this.playAudio("assets/audio/loginSound.mp3");
    }

    public playRoundStartAudio(): void {
        this.playAudio("assets/audio/round_start.mp3");
    }
    
    public playGameEndAudio(): void {
        this.playAudio("assets/audio/game_end.mp3");
    }

    public playWordFoundAudio(): void {
        this.playAudio("assets/audio/word_found.mp3");
    }

    public playTimeIsRunningOut(): void {
        this.playAudio("assets/audio/timeIsRunningOut.mp3");
    }

    public playMessagReceived(): void {
        this.playAudio("assets/audio/messageReceived.mp3");
    }

    public playRoundFinishedAudio(): void {
        this.playAudio("assets/audio/alarm.wav");
    }
}
