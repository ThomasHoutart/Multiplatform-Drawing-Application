import { UserNotInGameError } from "../errors/game";
import { PermissionError } from "../errors/generic";
import { ChatMessageReceivedEvent, GameChatMessageReceivedEvent } from "../events/chatEvents";
import { EliminatePlayerToSendEvent, EndRoundToSendEvent, LeaveGamePlayerToSendEvent, StartRoundToSendEvent, WordFoundToSendEvent, WordToDrawToSendEvent } from "../events/gameEvents";
import { List } from "../List";
import { Sleeper } from "../services/Sleeper";
import { GameType } from "../types/game";
import { Difficulty } from "./Difficulty";
import { Game } from "./game";
import { Lobby } from "./lobby";

export class BRGame extends Game {
    constructor(public lobby: Lobby, public difficulty: Difficulty, public avatarByUsername: (username: string) => number) {
        super(lobby, difficulty, GameType.BR, avatarByUsername);
        this.scores = new List();
    }

    async guess(ev: GameChatMessageReceivedEvent): Promise<void> {
        if (!this.lobby.participants.has(ev.author))
            throw new UserNotInGameError();
        if (this.lobby.spectators.has(ev.author) || this.currentArtist == ev.author || this.playerHasFoundWord.has(ev.author))
            throw new PermissionError();
        const correctWord = ev.message.toLowerCase() == this.currentWord.toLowerCase();
        if (!correctWord)
            return await new ChatMessageReceivedEvent(ev.author, ev.roomName, ev.message, ev.timestamp, ev.avatar).emit();
        await new WordFoundToSendEvent(this.lobby.participants, ev.author).emit();
        this.playerHasFoundWord.push(ev.author);
        if (this.shouldEndRound())
            await this.endRound();
    }

    // eslint-disable-next-line max-lines-per-function
    async leavePlayer(user: string, logout = false, silence = false, eliminated = false): Promise<void> {
        const receivers = new List(this.lobby.participants);
        if (logout)
            receivers.remove(user);
        this.lobby.players.remove(user);
        this.lobby.playersAndVirtualPlayers.remove(user);
        this.lobby.participants.remove(user);
        this.playersWhoHaveDrawn.remove(user);
        this.playerHasFoundWord.remove(user);
        if (eliminated)
            return;
        if (!silence)
            await new LeaveGamePlayerToSendEvent(receivers, user).emit();
        if (this.currentArtist == user)
            return this.endRound(true, true);
        if (this.shouldEndRound())
            return this.endRound(true);
    }

    shouldEndRound(): boolean {
        if (this.currentArtist.startsWith('bot_')) {
            const everyoneHasFoundWordExcept1Person = this.lobby.players.length() - this.playerHasFoundWord.length() == 1;
            if (everyoneHasFoundWordExcept1Person)
                return true;
        } else {
            const everyoneHasFoundWordExcept1PersonAndArtist = this.lobby.players.length() - this.playerHasFoundWord.length() == 2;
            if (everyoneHasFoundWordExcept1PersonAndArtist)
                return true;
        }
        const only2PlayersRemain = this.lobby.players.length() == 2;
        if (only2PlayersRemain)
            return true;
        return false;
    }

    // eslint-disable-next-line max-lines-per-function
    async startRound(): Promise<void> {
        this.stopTimers();
        this.timeLeft = this.timeToDraw;
        this.playerHasFoundWord = new List();
        if (this.wordChoices.length() == this.wordsUsed.length())
            this.wordsUsed = new List();
        this.wordChoices.shuffle();
        const word = this.wordChoices.find((word: string) => !this.wordsUsed.has(word));
        const next = this.lobby.players.length() > 2
            ? this.lobby.players.find((player: string) => !this.playersWhoHaveDrawn.has(player))
            : this.lobby.virtualPlayers.get(0).personality.name;
        if (!word || !next)
            return this.end();
        this.currentWord = word;
        this.currentArtist = next;
        this.currentWordHints = await this.difficulty.getHintsByWord(word);
        await new StartRoundToSendEvent(this.lobby.participants, next).emit();

        const ev = new WordToDrawToSendEvent(next, word);
        if (this.lobby.players.has(next)) {
            this.playersWhoHaveDrawn.push(next);
            await ev.emit();
        } else {
            const vp = this.lobby.virtualPlayers.find(vp => vp.personality.name == next);
            if (!vp)
                throw new Error('virtual player not found');
            await Sleeper.sleep(500);
            await vp.startDrawing(ev);
        }
        this.wordsUsed.push(this.currentWord);
        this.startTimer();
    }

    async updatePoints() {
        // eslint-disable-next-line require-await
        await this.playerHasFoundWord.foreach(async p => {
            const score = this.scores.find(s => s.username == p);
            if (score)
                score.score += 1;
        });
        if (this.currentArtist.startsWith('bot_'))
            return;
        const score = this.scores.find(s => s.username == this.currentArtist);
        if (score && this.playerHasFoundWord.length() != 0)
            score.score += 1;
    }

    async eliminate(someoneLeft?: boolean, isArtist?: boolean): Promise<void> {
        if (isArtist)
            return;
        const artistValue = this.currentArtist.startsWith('bot_') ? 0 : 1;
        const l = this.lobby.players.length() - artistValue - this.playerHasFoundWord.length();
        if (l == 1 && someoneLeft)
            return;
        let playerToEliminate: string | undefined = undefined;
        if (this.playerHasFoundWord.length() == 0) {
            if (!this.currentArtist.startsWith('bot_'))
                playerToEliminate = this.currentArtist;
        } else
            playerToEliminate = this.lobby.players.find(p => !this.playerHasFoundWord.has(p) && this.currentArtist != p);
        if (!playerToEliminate)
            return
        await new EliminatePlayerToSendEvent(this.lobby.participants, playerToEliminate).emit();
        await this.leavePlayer(playerToEliminate, false, true, true);
        await this.joinSpectator(playerToEliminate, true);
    }

    async endRound(someoneLeft?: boolean, isArtist?: boolean): Promise<void> {
        this.events = new List();
        this.stopTimers();
        await this.eliminate(someoneLeft, isArtist);
        await this.updatePoints();
        await new EndRoundToSendEvent(this.lobby.participants, this.scores, this.currentWord).emit();
        // eslint-disable-next-line require-await
        await this.lobby.virtualPlayers.foreach(async vp => vp.stopDrawing());
        if (this.lobby.players.length() < 2)
            return this.end();
        this.startRoundTimeout = Sleeper.setTimeout(() => this.startRound(), 5000);
        this.currentWord = '';
    }
}
