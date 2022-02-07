/* eslint-disable max-lines-per-function */

import { DatabaseController } from "../database/DatabaseController";
import { List } from "../List";
import { SocketMock, SocketServerMock } from "../mocks";
import { App } from "../server";
import { Salts } from "../services/network/HTTP/HttpAuthenticatorService";
import { SocketService } from "../services/network/Socket/SocketService";
import { Sleeper } from "../services/Sleeper";
import { LobbyCreateMessageReceived, WordToDrawMessageToSend, LobbyJoinMessageReceived } from "../types/game";
import { ChatMessageReceived } from "../types/message";

let app: App<SocketMock, SocketServerMock>;
let sockets: List<SocketMock>;
const login = async (s: SocketMock, user: string) => {
    const hs = app.hashService;
    const hashpw = hs.hashString(`${user}pw`);
    let salt: Salts = undefined as unknown as Salts;
    await app.httpService.httpAuthenticatorService.doRequestSalt({
        query: { user: `${user}` }
    }, {
        status: () => {
            return {
                json: (salts: Salts) => {
                    salt = salts;
                }
            }
        },
        sendStatus: (x: number) => {
            expect(x).toEqual(200);
        }
    });
    const hash: string = hs.hashString(salt.tempSalt + hs.hashString(salt.permSalt + hashpw)).toString();
    await s.emitClient('UserLogin', {
        username: `${user}`,
        hash: hash,
    });
}

const signUp = async (user: string) => {
    const hs = app.hashService;
    const hashpw = hs.hashString(`${user}pw`);
    await app.httpService.httpAuthenticatorService.doAuthRegister({
        body: {
            firstName: `${user}`,
            lastName: `${user}`,
            username: `${user}`,
            email: `${user}@gmail.com`,
            hash: hashpw.toString(),
            salt: '',
            avatar: parseInt(user[user.length - 1]),
        }
    }, {
        sendStatus: (x: number) => {
            expect(x).toEqual(200);
        }
    });
    expect(await app.userController.userExists(`${user}`)).toBeTruthy();
    expect(await app.roomController.isUserInRoom(`${user}`, 'General')).toBeTruthy();
}

const db: DatabaseController = new DatabaseController(false);

beforeAll(async () => {
    await db.init('BR');
    Sleeper.sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms/20));
    Sleeper.setTimeout = (f:any, ms: number) => setTimeout(f, ms/20);
    Sleeper.setInterval = (f:any, ms: number) => setInterval(f, ms/20);
});

afterAll(async () => {
    await app.clearDB();
    await db.disconnect();
});

beforeEach(async () => {
    const port: number = Number(process.env.PORT) || 3000;
    app = new App(port, db);
    await app.init();
    await app.clearDB();
    const serverMock = new SocketServerMock();
    app.socketService= new SocketService<SocketMock, SocketServerMock>(app.userService, serverMock);
    await app.socketService.init();
    await app.roomController.createGeneral();
    await app.wordImagePairController.init();
    sockets = new List<SocketMock>([new SocketMock('1'), new SocketMock('2'), new SocketMock('3')]);
    for (let i = 1; i <= 3; ++i) {
        expect(await app.userController.userExists(`user${i}`)).toBeFalsy();
        const s = sockets.get(i - 1);
        await app.socketService.io.emit('connection', s);
        await signUp(`user${i}`);
        await login(s, `user${i}`);
    }
});

describe('BR games', () => {
    it('should send Eliminate events', async () => {
        const lobbyCreateMessage: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'BR',
            difficulty: 'Hard',
        };

        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);

        let wordtodraw = '';
        let detective: SocketMock = sockets.get(0);

        sockets.get(0).onServer('WordToDraw', async (msg: WordToDrawMessageToSend) => {
            wordtodraw = msg.word;
            detective = sockets.get(1);
        });
        
        sockets.get(1).onServer('WordToDraw', async (msg: WordToDrawMessageToSend) => {
            wordtodraw = msg.word;
        });
        
        sockets.get(2).onServer('WordToDraw', async (msg: WordToDrawMessageToSend) => {
            wordtodraw = msg.word;
        });

        let gameStarted = false;
        sockets.get(0).onServer('StartGame', async () => {
            gameStarted = true;
        });

        let RoundStarted = false;
        sockets.get(0).onServer('StartRound', async () => {
            RoundStarted = true;
        });

        await sockets.get(0).emitClient('StartGame');
        expect(gameStarted).toBeFalsy();
        const msg: LobbyJoinMessageReceived = {
            gameName: lobbyCreateMessage.gameName,
        }
        await sockets.get(1).emitClient('JoinLobbyPlayer', msg);
        await sockets.get(2).emitClient('JoinLobbyPlayer', msg);
        await sockets.get(0).emitClient('StartGame');
        expect(gameStarted).toBeTruthy();
        expect(RoundStarted).toBeFalsy();

        await Sleeper.sleep(1000);

        expect(RoundStarted).toBeTruthy();
        expect(wordtodraw).not.toEqual('');

        const eliminated = [false, false, false];

        await sockets.foreach(async s => {
            await s.onServer('Eliminate', async () => {
                eliminated[parseInt(s.id) - 1] = true;
            });
        });

        await detective.emitClient('ChatMessage', { content: wordtodraw, roomName: 'Lobby:' + lobbyCreateMessage.gameName } as ChatMessageReceived);
    
        expect(eliminated).toEqual([true, true, true]);

        await app.gameService.games.get(0)?.end();
    });

    it('should play a BR game', async () => {
        const lobbyCreateMessage: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'BR',
            difficulty: 'Hard',
        };

        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);

        let wordtodraw = '';
        let detective: SocketMock = sockets.get(0);

        sockets.get(0).onServer('WordToDraw', async (msg: WordToDrawMessageToSend) => {
            wordtodraw = msg.word;
            detective = sockets.get(1);
        });
        
        sockets.get(1).onServer('WordToDraw', async (msg: WordToDrawMessageToSend) => {
            wordtodraw = msg.word;
        });
        
        sockets.get(2).onServer('WordToDraw', async (msg: WordToDrawMessageToSend) => {
            wordtodraw = msg.word;
        });

        let gameStarted = false;
        sockets.get(0).onServer('StartGame', async () => {
            gameStarted = true;
        });

        let RoundStarted = false;
        sockets.get(0).onServer('StartRound', async () => {
            RoundStarted = true;
        });

        const msg: LobbyJoinMessageReceived = {
            gameName: lobbyCreateMessage.gameName,
        }
        await sockets.get(1).emitClient('JoinLobbyPlayer', msg);
        await sockets.get(2).emitClient('JoinLobbyPlayer', msg);
        await sockets.get(0).emitClient('StartGame');
        expect(gameStarted).toBeTruthy();
        expect(RoundStarted).toBeFalsy();

        await Sleeper.sleep(1000);

        expect(RoundStarted).toBeTruthy();
        expect(wordtodraw).not.toEqual('');

        let eliminated = [false, false, false];
        let eliminatedPlayer = '';
        let gameEnded = false;
        let roundEnded = false;
        await sockets.foreach(async s => {
            s.onServer('Eliminate', async (msg: {username: string}) => {
                eliminatedPlayer = msg.username;
                eliminated[parseInt(s.id) - 1] = true;
            });
            s.onServer('EndGame', async () => {
                gameEnded = true;
            });
            s.onServer('EndRound', async () => {
                roundEnded = true;
            });
        });

        expect(roundEnded).toBeFalsy();
        expect(eliminated).toEqual([false, false, false]);
        await detective.emitClient('ChatMessage', {content: wordtodraw, roomName: 'Lobby:' + lobbyCreateMessage.gameName } as ChatMessageReceived);
        expect(roundEnded).toBeTruthy();
        expect(eliminated).toEqual([true, true, true]);
        roundEnded = false;
        eliminated = [false, false, false];

        const expectedPlayers = new List(['user1', 'user2', 'user3']);
        expectedPlayers.remove(eliminatedPlayer);
        const realPlayers = app.gameService.games.get(0).lobby.players;
        realPlayers.sort();
        expect(realPlayers).toEqual(expectedPlayers);

        expect(gameEnded).toBeFalsy();
        await Sleeper.sleep(50000);
        expect(gameEnded).toBeFalsy();
        await app.gameService.games.get(0)?.end();
    });
});
