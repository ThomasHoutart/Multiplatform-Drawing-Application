import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { WAITING_FOR_WORD } from 'src/app/components/menu/gamemode/game-view/info-bar/constant';
import { DrawingMessage } from 'src/app/models/interface/drawing-message';
import { GameInfo, Player, UserInGame } from 'src/app/models/interface/game';
import { Lobby, UserInLobby } from 'src/app/models/interface/lobby';
import { SPACE } from 'src/constant/constant';
import { LINE_TAG, ORIGIN_TAG } from 'src/constant/svg/constant';
import { Point } from 'src/interface/Point';
import { Path } from 'src/interface/trace/pencil';
import { SPECTATOR } from '../lobby/constant';
import { PathConverterService } from '../path-converter/path-converter.service';
import { UserService } from '../user/user.service';
import { DrawingSocketHandlerService } from '../websocket/drawingSocketHandler/drawing-socket-handler.service';
import { GameSocketHandlerService } from '../websocket/gameSocketHandler/game-socket-handler.service';

@Injectable({
    providedIn: 'root'
})
export class GameService {
    gameInfo: GameInfo;
    isGame: boolean;
    isUserDrawing: boolean;
    playersScore: UserInGame[];
    drawingElements: Path[]
    updateDrawingView: Subject<Path[]>;
    updateGameInfo: Subject<void>
    updatePlayerScore: Subject<void>;
    drawingSurfaceSize: number;

    constructor(
        private socket: GameSocketHandlerService,
        private drawingSocket: DrawingSocketHandlerService,
        private converter: PathConverterService,
        private user: UserService) {
        this.resetGameSettings();
        this.resetGameInfo();
        this.updateDrawingView = new Subject<Path[]>();
        this.updateGameInfo = new Subject<void>();
        this.updatePlayerScore = new Subject<void>();
        this.playersScore = [];
    } 

    public resetGameInfo(): void {
        this.gameInfo = {
            gameName: '',
            word: WAITING_FOR_WORD,
            timeLeft: null,
            roundNb: 0,
            difficulty: '',
        }
        this.playersScore = [];
    }

    public softReset(): void {
        this.playersScore = []
        this.gameInfo.roundNb = 0
    }

    public initializeScore(players: Player[]): void {
        for (const player of players) {
            this.playersScore.push({
                username: player.username,
                score: player.score,
                avatar: player.avatar,
                placementPosition: 1,
            } as UserInGame)
        }
    }

    public updateScore(players: Player[]): void {
        for (const player of players) {
            for (const gamePlayer of this.playersScore) {
                if (player.username === gamePlayer.username) {
                    gamePlayer.scoreVarFromLastRound = player.score - gamePlayer.score;
                    gamePlayer.score = player.score;
                }
            }
        }
    }

    public getGameInfo(): Observable<Player[]> {
        return this.socket.getGameInfo();
    }

    public sendUserScoreUpdate(): void {
        this.updatePlayerScore.next()
    }

    public getUserScoreUpdate(): Observable<void> {
        return this.updatePlayerScore.asObservable();
    }

    public getServerUpdateDrawing(): Observable<Path[]> {
        return this.updateDrawingView.asObservable();
    }

    public sendServerUpdateDrawing(): void {
        this.updateDrawingView.next(this.drawingElements);
    }

    public sendGameInfo(): void {
        this.updateGameInfo.next();
    }

    public getGameInfoUpdate(): Observable<void> {
        return this.updateGameInfo.asObservable();
    }

    public initializePlayerList(userInLobby: UserInLobby[]): void {
        for (const user of userInLobby) {
            if (user.role !== SPECTATOR) {
                this.playersScore.push({
                    username: user.username,
                    score: 0,
                    scoreVarFromLastRound: 0,
                    avatar: user.avatar,
                    placementPosition: 1,
                } as UserInGame)
            }
        }
    }

    public resetGameSettings(): void {
        this.isGame = false;
        this.isUserDrawing = false;
        this.drawingElements = [];
    }

    public incrementRound(): void {
        if (this.gameInfo.roundNb)
            this.gameInfo.roundNb += 1;
        else
            this.gameInfo.roundNb = 1;
    }

    public getPathIndex(id: number): number {
        for (let i = 0; i < this.drawingElements.length; i++)
            if (this.drawingElements[i].uniqueId === id)
                return i;
        return -1;
    }

    public makeDesktopDrawingElement(drawingMessage: DrawingMessage): Path {
        return {
            uniqueId: drawingMessage.pathId,
            shareId: drawingMessage.pathId,
            path: this.converter.convertPathServerToDesktopPath(drawingMessage, this.drawingSurfaceSize),
            thickness: parseFloat(
                this.converter.adjustPathCoordinate(drawingMessage.strokeWidth.toString(), drawingMessage.canvasSize, this.drawingSurfaceSize
                )),
            color: '#' + drawingMessage.color.substring(3),
            opacity: this.converter.opacityConverter(drawingMessage.color.substr(1, 2)),
            canvasSize: drawingMessage.canvasSize,
        } as Path;
    }

    public makeServerDrawingElement(path: Path): DrawingMessage {
        return {
            pathId: path.uniqueId,
            color: '#' + this.converter.rgbToHex(this.converter.opacityToRgb(path.opacity)) + path.color.substring(1),
            strokeWidth: path.thickness,
            path: this.converter.convertDesktopPathToServerPath(path.path),
            canvasSize: this.drawingSurfaceSize,
        } as DrawingMessage;
    }

    public setDrawingLogic(drawingMessage: DrawingMessage): void {
        if (!this.isUserDrawing && this.isGame) {
            const id: number = this.getPathIndex(drawingMessage.pathId);
            if (id !== - 1) {
                this.drawingElements[id] = this.makeDesktopDrawingElement(drawingMessage);
            } else {
                this.drawingElements.push(this.makeDesktopDrawingElement(drawingMessage));
            }
            this.sendServerUpdateDrawing();
        }
    }

    public updateDrawingLogic(point: Point): void {
        if (!this.isUserDrawing && this.isGame) {
            if (this.drawingElements[this.drawingElements.length - 1].path.length === 0)
                this.lineToPath(ORIGIN_TAG, point);
            this.lineToPath(LINE_TAG, point);
            this.sendServerUpdateDrawing();
        }
    }

    public lineToPath(lineType: string, point: Point): void {
        this.drawingElements[this.drawingElements.length - 1].path += lineType
            + this.converter.adjustPathCoordinate(point.x.toString(), this.drawingElements[this.drawingElements.length - 1].canvasSize, this.drawingSurfaceSize)
            +SPACE + this.converter.adjustPathCoordinate(point.y.toString(), this.drawingElements[this.drawingElements.length - 1].canvasSize, this.drawingSurfaceSize);
    }

    public setPathToServer(path: Path): void {
        if (this.isGame && this.isUserDrawing)
            this.drawingSocket.setNewPath(this.makeServerDrawingElement(path));
    }

    public updatePathToServer(point: Point): void {
        if (this.isGame && this.isUserDrawing)
            this.drawingSocket.appendToPath(point);
    }

    public setPathListener(): Observable<DrawingMessage> {
        return this.drawingSocket.getSetPathUpdate();
    }

    public appendPathListener(): Observable<Point> {
        return this.drawingSocket.getAppendPathUpdate();
    }

    public leaveGame(): void {
        //this.lobby.sendBackToGameCreation();
        this.user.status.isSpectator ?
            this.socket.leaveGameAsSpectator() :
            this.socket.leaveGameAsPlayer();
    }

    public joinGameAsSpectator(gameInfo: Lobby): void {
        return this.socket.joinGameAsSpectator(gameInfo.gameName);
    }

    public leaveGameListener(): Observable<string> {
        return this.socket.getLeaveGameUpdate();
    }

    public wordToDrawListener(): Observable<string> {
        return this.socket.getWordToDrawUpdate();
    }

    public eliminatedListener(): Observable<string> {
        return this.socket.getEliminatedUpdate();
    }

    public gameTickListener(): Observable<number> {
        return this.socket.getGameTickUpdate();
    }

    public wordFoundListener(): Observable<string> {
        return this.socket.getWordFoundUpdate();
    }

    public hintListener(): Observable<string> {
        return this.socket.getHintUpdate();
    }

    public endGameListener(): Observable<string> {
        return this.socket.getEndGameUpdate();
    }

    public endRoundListener(): Observable<GameInfo> {
        return this.socket.getEndRoundUpdate();
    }

    public joinGameSpectatorListener(): Observable<GameInfo> {
        return this.socket.getJoinGameSpectatorUpdate();
    }

    public startRoundListener(): Observable<string> {
        return this.socket.getStartRoundUpdate();
    }
}
