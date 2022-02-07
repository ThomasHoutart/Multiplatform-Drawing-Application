import { UserAlreadyInGameError } from "../errors/game";
import { ChatMessageReceivedEvent, ChatMessageToSendEvent, GameChatMessageReceivedEvent } from "../events/chatEvents";
import { GameTickToSendEvent, JoinGameSpectatorToSendEvent, LeaveGameSpectatorToSendEvent, GameInfoToSendEvent, SetPathToSendEvent, AppendToPathToSendEvent, EndGameToSendEvent, LeaveGamePlayerReceivedEvent } from "../events/gameEvents";
import { List } from "../List";
import { Sleeper } from "../services/Sleeper";
import { GameType, UsernameScoreAvatar } from "../types/game";
import { ChatMessageToSend } from "../types/message";
import { Difficulty } from "./Difficulty";
import { Lobby } from "./lobby";

type Vote = {
    target: string,
    votes: List<boolean>,
    users: List<string>
}

export abstract class Game {
    public scores: List<UsernameScoreAvatar>;
    public timeToDraw: number;
    public wordChoices: List<string>;
    public timer: NodeJS.Timeout;
    public startRoundTimeout: NodeJS.Timeout;
    public timeLeft: number;
    public events: List<SetPathToSendEvent | AppendToPathToSendEvent>;

    public virtPlayerGuessTime: number;
    public virtPlayerCommentTime: number;

    public wordsUsed: List<string>;
    public playersWhoHaveDrawn: List<string>;
    public playerHasFoundWord: List<string>;

    public currentArtist: string;
    public currentWord: string;
    public currentWordHints: List<string>;

    public startTime: Date;

    public vote: Vote | undefined;
    public voteKickTimeout: NodeJS.Timeout;
    public voteWarnTimeout: NodeJS.Timeout;

    constructor(public lobby: Lobby, public difficulty: Difficulty, public gameType: GameType, public avatarByUsername: (username: string) => number) {
        this.events = new List();
        this.wordsUsed = new List();
        this.wordChoices = new List();
        this.playersWhoHaveDrawn = new List();
        this.playerHasFoundWord = new List();
        this.scores = new List();
        this.currentArtist = '';
        this.currentWord = '';
        this.currentWordHints = new List();
        this.timeLeft = 0;
        this.timeToDraw = 0;
        this.vote = undefined;
    }

    abstract startRound(): Promise<void>;
    abstract endRound(): Promise<void>;
    abstract guess(ev: GameChatMessageReceivedEvent): Promise<void>;
    abstract leavePlayer(user: string, logout: boolean): Promise<void>;
    
    getHint(): string {
        let hint = this.currentWordHints.pop();
        if (hint === undefined) hint = "All hints have been given";
        return hint;
    }

    async initiateVoteKick(target: string, room: string, author: string) {
        const message = { _id: 0, author: "bot_COMMAND", roomName: room, content: '', timestamp: new Date().toString(), avatar: 0} as ChatMessageToSend;
        if (this.vote !== undefined)
            return await new ChatMessageToSendEvent(new List([author]), {...message, content:"Cannot initiate kick when another vote is in progress"}).emit();
        if (!this.lobby.playersAndVirtualPlayers.has(target))
        return await new ChatMessageToSendEvent(new List([author]), {...message, content:`Player ${target} cannot be found in room`}).emit();
        if (!this.lobby.playersAndVirtualPlayers.has(author))
            throw new Error("Player attempting to kick in a room he is not in")
        this.vote = {target: target, votes: new List([true]), users: new List([author])};
        (console).log("VoteKick init")
        await new ChatMessageReceivedEvent("bot_KICK", room, `VoteKick initiated against ${target}, /yes to kick, /no to keep and type /help for more instructions`, new Date(), 0).emit();
        await new ChatMessageReceivedEvent("bot_KICK", room, `Votes are KICK: ${1}, KEEP: ${0}`, new Date(), 0).emit();
        this.voteWarnTimeout = Sleeper.setTimeout(async () => await new ChatMessageReceivedEvent("bot_KICK", room, `15 seconds left before vote against ${target} is cancelled`, new Date(), 0).emit(), 45 * 1000);
        this.voteKickTimeout = Sleeper.setTimeout(async () => await this.cancelVoteKick(room), 60 * 1000);
    }

    async voteKick(user: string, isKick: boolean, room: string) {
        if (!this.lobby.playersAndVirtualPlayers.has(user))
            throw new Error("Player cannot vote: Player not found")
        const message = { _id: 0, author: "bot_COMMAND", roomName: room, content: '', timestamp: new Date().toString(), avatar: 0} as ChatMessageToSend;
        if (this.vote === undefined)
            return await new ChatMessageToSendEvent(new List([user]), {...message, content:"Cannot vote when kick is not in progress"}).emit();
        if (this.vote.users.has(user))
            return await new ChatMessageToSendEvent(new List([user]), {...message, content:"you cannot vote twice!"}).emit();
        this.vote.votes.push(isKick)
        this.vote.users.push(user)
        const halfVotes = this.lobby.players.length() / 2;
        const nKick = this.vote.votes.count(true)
        const nKeep = this.vote.votes.count(false)
        await new ChatMessageReceivedEvent("bot_KICK", room, `Votes are KICK: ${nKick} KEEP: ${nKeep}`, new Date(), 0).emit();
        if (nKeep == halfVotes) {
            await this.keepPlayer(this.vote.target, room)
        } else if (nKick > halfVotes) {
            await this.kickPlayer(this.vote.target, room)
        }
    }

    public async keepPlayer(target: string, room:string) {
        clearTimeout(this.voteKickTimeout)
        clearTimeout(this.voteWarnTimeout)
        await new ChatMessageReceivedEvent("bot_KICK", room, `${target} has not been kicked`, new Date(), 0).emit();
        this.vote = undefined;
    }

    public async kickPlayer(target: string, room:string) {
        clearTimeout(this.voteKickTimeout)
        clearTimeout(this.voteWarnTimeout)
        await new ChatMessageReceivedEvent("bot_KICK", room, `${target} has been kicked from the game, however his score remains in the leaderboard`, new Date(), 0).emit();
        await new LeaveGamePlayerReceivedEvent(target).emit();
        this.vote = undefined;
    }

    public async cancelVoteKick(room: string) {
        clearTimeout(this.voteKickTimeout)
        clearTimeout(this.voteWarnTimeout)
        await new ChatMessageReceivedEvent("bot_KICK", room, `Vote against ${this.vote?.target} cancelled since 60 seconds passed without majority consensus`, new Date(), 0).emit();
        this.vote = undefined
    }

    public async end(): Promise<void> {
        this.stopTimers();
        clearTimeout(this.voteKickTimeout)
        clearTimeout(this.voteWarnTimeout)
        await new EndGameToSendEvent(this.lobby.gameName, this.startTime, new Date().valueOf() - this.startTime.valueOf(), this.scores, this.difficulty.getName(), this.gameType).emit();
        // eslint-disable-next-line require-await
        await this.lobby.virtualPlayers.foreach(async vp => vp.stopDrawing());
    }

    async joinSpectator(user: string, silence = false): Promise<void> {
        if (this.lobby.spectators.has(user))
            throw new UserAlreadyInGameError();
        this.lobby.spectators.push(user);
        this.lobby.participants.push(user);
        if (silence)
            return;
        await new JoinGameSpectatorToSendEvent(this.lobby.participants, user).emit();
        await new GameInfoToSendEvent(user, this.scores).emit();
        await Sleeper.sleep(500);
        await this.events.foreach(async ev => {
            ev.receivers = new List([user]);
            await ev.emit();
        });
    }

    async leaveSpectator(user: string, logout = false): Promise<void> {
        const receivers = new List(this.lobby.participants);
        if (logout)
            receivers.remove(user);
        this.lobby.spectators.remove(user);
        this.lobby.participants.remove(user);
        await new LeaveGameSpectatorToSendEvent(receivers, user).emit();
    }

    async secondPassed(): Promise<void> {
        await new GameTickToSendEvent(this.lobby.participants, this.timeLeft).emit();
        this.timeLeft -= 1;
        if (this.timeLeft >= 0)
            return await this.checkVirtPlayerActions()
        this.stopTimers();
        await this.endRound();
    }

    async checkVirtPlayerActions() {
        if (this.lobby.virtualPlayers.length() && this.virtPlayerCommentTime && this.timeLeft == this.virtPlayerCommentTime) {
            this.lobby.virtualPlayers.shuffle();
            const randomVirtPlayer = this.lobby.virtualPlayers.get(0);
            this.lobby.players.shuffle();
            const randomUser = this.lobby.players.get(0);
            await new ChatMessageReceivedEvent(randomVirtPlayer.personality.name, 'Lobby:' + this.lobby.gameName, 
                await randomVirtPlayer.comment(randomUser), new Date(), randomVirtPlayer.personality.avatar).emit();
        }
    }

    async start(): Promise<void> {
        this.startTime = new Date();
        clearTimeout(this.startRoundTimeout);
        this.wordChoices = await this.difficulty.getWords();
        this.timeToDraw = this.difficulty.getTime();
        this.lobby.players.shuffle();
        this.lobby.playersAndVirtualPlayers.shuffle();
        await this.lobby.players.foreach(async p => await this.scores.push({username: p, score: 0, avatar: this.avatarByUsername(p)}));
        this.startRoundTimeout = Sleeper.setTimeout(() => this.startRound(), 500);
    }

    startTimer(): void {
        this.stopTimers();
        this.timer = Sleeper.setInterval(() => this.secondPassed(), 1000);
    }

    stopTimers(): void {
        clearInterval(this.timer);
        clearTimeout(this.startRoundTimeout);
    }
}
