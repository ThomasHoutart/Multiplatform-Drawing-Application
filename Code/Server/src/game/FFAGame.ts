import { UserNotInGameError } from "../errors/game";
import { PermissionError } from "../errors/generic";
import { ChatMessageReceivedEvent, GameChatMessageReceivedEvent } from "../events/chatEvents";
import { EndRoundToSendEvent, LeaveGamePlayerToSendEvent, StartRoundToSendEvent, WordFoundToSendEvent, WordToDrawToSendEvent } from "../events/gameEvents";
import { List } from "../List";
import { Sleeper } from "../services/Sleeper";
import { GameType } from "../types/game";
import { Difficulty } from "./Difficulty";
import { Game } from "./game";
import { Lobby } from "./lobby";

export class FFAGame extends Game {
    public round = 0;
    public wordFoundTimeLeft: Map<string, number>;
    public foundIndex: Map<string, number>;
    public index = 0;

    constructor(public lobby: Lobby, public difficulty: Difficulty, public avatarByUsername: (username: string) => number) {
        super(lobby, difficulty, GameType.FFA, avatarByUsername);
        this.scores = new List();
        this.wordFoundTimeLeft = new Map();
        this.foundIndex = new Map();
    }

    async guess(ev: GameChatMessageReceivedEvent): Promise<void> {
        if (!this.lobby.playersAndVirtualPlayers.has(ev.author))
            throw new UserNotInGameError();
        if (this.lobby.spectators.has(ev.author) || this.currentArtist == ev.author || this.playerHasFoundWord.has(ev.author))
            throw new PermissionError();
        const correctWord = ev.message.toLowerCase() == this.currentWord.toLowerCase();
        if (!correctWord)
            return await new ChatMessageReceivedEvent(ev.author, ev.roomName, ev.message, ev.timestamp, ev.avatar).emit();
        await new WordFoundToSendEvent(this.lobby.participants, ev.author).emit();
        this.playerHasFoundWord.push(ev.author);
        this.wordFoundTimeLeft.set(ev.author, this.timeLeft);
        this.foundIndex.set(ev.author, this.index);
        this.index += 1;
        const zeroIfArtistBotElseOne = this.currentArtist.startsWith('bot_') ? 0 : 1;
        const everyoneHasFoundWord = this.lobby.players.length() - this.playerHasFoundWord.length() == zeroIfArtistBotElseOne;
        if (everyoneHasFoundWord)
            await this.endRound();
    }
    
    // eslint-disable-next-line max-lines-per-function
    async startRound(): Promise<void> {
        this.round += 0.5;
        this.stopTimers();
        this.timeLeft = this.timeToDraw;
        this.playerHasFoundWord = new List();
        this.wordFoundTimeLeft = new Map();
        this.index = 0;
        if (this.wordChoices.length() == this.wordsUsed.length())
            this.wordsUsed = new List();
        this.wordChoices.shuffle();
        const word = this.wordChoices.find((word: string) => !this.wordsUsed.has(word));
        const next = this.lobby.playersAndVirtualPlayers.find((player: string) => !this.playersWhoHaveDrawn.has(player));
        if (!word || !next)
            return this.end();
        this.currentWord = word;
        this.currentArtist = next;
        this.currentWordHints = await this.difficulty.getHintsByWord(word);
        this.virtPlayerCommentTime = (Math.floor(Math.random() * this.timeToDraw))
        this.virtPlayerGuessTime = (Math.floor(Math.random() * this.timeToDraw))
        await new StartRoundToSendEvent(this.lobby.participants, next).emit();
        const ev = new WordToDrawToSendEvent(next, word);
        if (this.lobby.players.has(next))
            await ev.emit();
        else {
            const vp = this.lobby.virtualPlayers.find(vp => vp.personality.name == next);
            if (!vp)
                throw new Error('virtual player not found');
            await Sleeper.sleep(500);
            await vp.startDrawing(ev);
        }
        this.playersWhoHaveDrawn.push(next);
        this.wordsUsed.push(this.currentWord);
        this.startTimer();
    }

    async leavePlayer(user: string, logout = false): Promise<void> {
        const receivers = new List(this.lobby.participants);
        if (logout)
            receivers.remove(user);
        this.lobby.players.remove(user);
        this.lobby.playersAndVirtualPlayers.remove(user);
        if (user.startsWith('bot_')) {
            const vp = this.lobby.virtualPlayers.find(vp => vp.personality.name == user);
            if (!vp) throw new Error(`VP ${user} not found in lobby`)
            this.lobby.virtualPlayers.remove(vp);
        }
        this.lobby.participants.remove(user);
        this.playersWhoHaveDrawn.remove(user);
        this.playerHasFoundWord.remove(user);
        await new LeaveGamePlayerToSendEvent(receivers, user).emit();
        if (this.currentArtist == user)
            return await this.endRound();
        const zeroIfArtistBotElseOne = this.currentArtist.startsWith('bot_') ? 0 : 1;
        const everyoneHasFoundWord = this.lobby.players.length() - this.playerHasFoundWord.length() == zeroIfArtistBotElseOne;
        if (everyoneHasFoundWord)
            await this.endRound();
    }

    // eslint-disable-next-line max-lines-per-function
    async updatePoints() {
        // eslint-disable-next-line require-await
        const artistScore = this.scores.find(s => s.username == this.currentArtist);
        const isbot = this.currentArtist.startsWith('bot_');
        if (!artistScore && !isbot)
            return;
        // eslint-disable-next-line require-await
        await this.playerHasFoundWord.foreach(async p => {
            const score = this.scores.find(s => s.username == p);
            if (!score)
                return;
            const Ti = this.wordFoundTimeLeft.get(score.username);
            if (!Ti)
                return;
            const n = this.foundIndex.get(score.username);
            if (n == undefined)
                return;
            const N =  this.lobby.players.length();
            const delta = 10 * Ti - 50 * n / N;
            const added = delta > 0 ? delta + 100 : 100;
            score.score += Math.floor(added + 100);
            if (!isbot && artistScore)
                artistScore.score += Math.floor(added / 2 + 25 * Ti);
        });
        if (!isbot && artistScore && this.playerHasFoundWord.length() == (this.lobby.players.length() - 1))
            artistScore.score += 250;
    }

    async endRound(): Promise<void> {
        this.events = new List();
        this.round += 0.5;
        this.stopTimers();
        await this.updatePoints();
        await new EndRoundToSendEvent(this.lobby.participants, this.scores, this.currentWord).emit();
        // eslint-disable-next-line require-await
        await this.lobby.virtualPlayers.foreach(async vp => vp.stopDrawing());
        if (this.playersWhoHaveDrawn.length() == this.lobby.playersAndVirtualPlayers.length() || this.lobby.players.length() < 2)
            return this.end();
        this.startRoundTimeout = Sleeper.setTimeout(async () => {
            await this.startRound();
        }, 5000);
        this.currentWord = '';
    }
}
