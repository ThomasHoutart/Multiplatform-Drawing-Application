import express from "express";
import { Game } from "../../../game/game";
import { Lobby } from "../../../game/lobby";
import { GameService } from "../../Core/GameService";

export class HttpGameService {
    constructor(private app: express.Express, private gameService: GameService) { }

    public init(): void {
        this.GameList();
    }

    private GameList() {
        this.app.get('/game/list/', async (request, response) => {
            await this.getGameList(request, response);
        });
    }

    public getGameList = async (request: any, response: any) => {
        try {
            const f = (lobby: Lobby) => {
                return {
                    gameName: lobby.gameName,
                    playerCount: lobby.participants.length(),
                    gameMode: lobby.gameMode,
                    difficulty: lobby.difficulty.getName(),
                }
            }
            const g = (game: Game) => f(game.lobby);
            response.status(200).json({
                games: (await this.gameService.games.map(g)).getArray(),
                lobbies: (await this.gameService.lobbies.map(f)).getArray(),
            });
        } catch (e) {
            this.respondWithError(e, response);
        }
    }

    private respondWithError(e: Error, response: any) {
        response.sendStatus(400);
    }
}
