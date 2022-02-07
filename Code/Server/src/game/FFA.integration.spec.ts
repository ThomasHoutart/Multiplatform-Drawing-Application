/* eslint-disable max-lines-per-function */

import { SocketMock, SocketServerMock } from '../mocks'
import { App } from '../server'
import { SocketService } from '../services/network/Socket/SocketService'
import { Salts } from '../services/network/HTTP/HttpAuthenticatorService';
import { List } from '../List';
import { AppendToPathMessage, EndRoundMessageToSend, LobbyCreateMessageReceived, LobbyJoinMessageReceived, SetPathMessage, UsernameScoreAvatar, WordToDrawMessageToSend } from '../types/game';
import { ChatMessageReceived } from '../types/message';
import { Sleeper } from '../services/Sleeper';
import { DatabaseController } from '../database/DatabaseController';

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
    await db.init('FFA');
});

afterAll(async () => {
    await app.clearDB();
    await db.disconnect();
});

beforeEach(async () => {
    const port: number = Number(process.env.PORT) || 3000;
    app = new App(port, db);
    Sleeper.sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms/20));
    Sleeper.setTimeout = (f:any, ms: number) => setTimeout(f, ms/20);
    Sleeper.setInterval = (f:any, ms: number) => setInterval(f, ms/20);
    await app.clearDB();
    await app.init();
    const serverMock = new SocketServerMock();
    app.socketService= new SocketService<SocketMock, SocketServerMock>(app.userService, serverMock);
    await app.socketService.init();
    await app.roomController.createGeneral();
    await app.wordImagePairController.init();
    sockets = new List<SocketMock>();
    for (let i = 1; i <= 5; ++i) {
        const s = new SocketMock(`${i}`);
        sockets.push(s)
        expect(await app.userController.userExists(`user${i}`)).toBeFalsy();
        await app.socketService.io.emit('connection', s);
        await signUp(`user${i}`);
        await login(s, `user${i}`);
    }
});

describe('FFA Integration', () => {
    it('should play an easy FFA game', async () => {
        const createMsg: LobbyCreateMessageReceived = {
            gameName: 'game',
            gameMode: 'FFA',
            difficulty: 'Easy',
        }

        const joinMsg: LobbyJoinMessageReceived = {
            gameName: 'game',
        }

        const chatMsg: ChatMessageReceived = {
            roomName: 'Lobby:' + createMsg.gameName,
            content: 'Hello',
        }

        let endRound = 0;
        await sockets.foreach(async (socket: SocketMock) => {
            socket.onServer('EndRound', async (msg: EndRoundMessageToSend) => {
                endRound += 1;
                const scores = new List<UsernameScoreAvatar>(msg.scores);
                let sum = 0;
                // eslint-disable-next-line require-await
                await scores.foreach(async s => {
                    sum += s.score;
                });
                expect(sum).toBeGreaterThan(5000);
            });
        });

        await sockets.get(0).emitClient('CreateLobby', createMsg);
        await sockets.get(1).emitClient('JoinLobbyPlayer', joinMsg);
        await sockets.get(4).emitClient('JoinLobbySpectator', joinMsg);
        await sockets.get(2).emitClient('JoinLobbyPlayer', joinMsg);
        await sockets.get(3).emitClient('JoinLobbyPlayer', joinMsg);

        expect(app.gameService.lobbies.get(0).participants.getArray()).toEqual(['user1', 'user2', 'user5', 'user3', 'user4']);
        expect(app.gameService.lobbies.get(0).players.getArray()).toEqual(['user1', 'user2', 'user3', 'user4']);
        expect(app.gameService.lobbies.get(0).spectators.getArray()).toEqual(['user5']);

        let chatMessage = 0;
        await sockets.foreach(async (socket: SocketMock) => {
            socket.onServer('ChatMessage', async () => {
                chatMessage += 1;
            })
        });
        await sockets.foreach(async (socket: SocketMock) => {
            await socket.emitClient('ChatMessage', chatMsg)
        });
        expect(chatMessage).toEqual(25);
        chatMessage = 0;

        let startGame = 0;
        await sockets.foreach(async (socket: SocketMock) => {
            socket.onServer('StartGame', async () => {
                startGame += 1;
            })
        });
        await sockets.get(0).emitClient('StartGame');
        expect(startGame).toEqual(5);
        startGame = 0;

        await sockets.foreach(async (socket: SocketMock) => {
            await socket.emitClient('ChatMessage', chatMsg)
        });
        expect(chatMessage).toEqual(20);
        chatMessage = 0;

        const artist = new List<SocketMock>();
        const artists = new List<SocketMock>();
        let detectives = new List(sockets);
        detectives.remove(detectives.get(4));
        let word = '';
        let startRound = 0;
        await sockets.foreach(async (socket: SocketMock) => {
            socket.onServer('StartRound', async () => {
                startRound += 1;
            })
            socket.onServer('WordToDraw', async (msg: WordToDrawMessageToSend) => {
                artist.push(socket);
                artists.remove(socket);
                artists.push(socket);
                detectives.remove(socket);
                word = msg.word;
            })
        });
        expect(startRound).toEqual(0);
        await Sleeper.sleep(5000);
        expect(startRound).toEqual(5);
        startRound = 0;
        
        await sockets.foreach(async (socket: SocketMock) => {
            await socket.emitClient('ChatMessage', chatMsg)
        });

        expect(artist.length()).toEqual(1);
        expect(detectives.length()).toEqual(3);
        expect(detectives.has(artist.get(0))).toBeFalsy();
        expect(word.length).toBeGreaterThan(0);
        expect(chatMessage).toEqual(15);
        chatMessage = 0;

        const setPathMsg: SetPathMessage = {
            pathId: 0,
            path: '123 123 123 123',
            color: '#FFFFFF',
            canvasSize: 600,
            strokeWidth: 20,
        }
        
        const appendToPathMsg: AppendToPathMessage = {
            x: 155,
            y: 166,
        }

        let setPath = 0;
        let appendToPath = 0;
        await sockets.foreach(async (socket: SocketMock) => {
            socket.onServer('SetPath', async (msg: SetPathMessage) => {
                setPath += 1;
                expect(msg).toEqual(setPathMsg);
            })
            socket.onServer('AppendToPath', async (msg: AppendToPathMessage) => {
                appendToPath += 1;
                expect(msg).toEqual(appendToPathMsg);
            })
        });

        await artist.get(0).emitClient('SetPath', setPathMsg);
        expect(setPath).toEqual(5);
        setPath = 0;

        await artist.get(0).emitClient('AppendToPath', appendToPathMsg);
        expect(appendToPath).toEqual(5);
        appendToPath = 0;

        await detectives.get(0).emitClient('SetPath', setPathMsg);
        expect(setPath).toEqual(0);

        await detectives.get(0).emitClient('AppendToPath', appendToPathMsg);
        expect(appendToPath).toEqual(0);

        const randomMessage: ChatMessageReceived = {
            content: 'hello guys!',
            roomName: 'Lobby:' + createMsg.gameName,
        }

        const winningMessage1: ChatMessageReceived = {
            content: word,
            roomName: 'Lobby:' + createMsg.gameName,
        }

        let wordFound = 0;
        await sockets.foreach(async (socket: SocketMock) => {
            socket.onServer('WordFound', async () => {
                wordFound += 1;
            });
        });

        await detectives.get(0).emitClient('ChatMessage', randomMessage);
        expect(chatMessage).toEqual(5);
        expect(wordFound).toEqual(0);
        chatMessage = 0;

        let endGame = 0;
        await sockets.foreach(async (socket: SocketMock) => {
            socket.onServer('EndGame', async () => {
                endGame += 1;
            });
        });

        await detectives.get(0).emitClient('ChatMessage', winningMessage1);
        expect(chatMessage).toEqual(0);
        expect(wordFound).toEqual(5);
        expect(endGame).toEqual(0);
        expect(endRound).toEqual(0);
        wordFound = 0;

        await detectives.get(0).emitClient('ChatMessage', randomMessage);
        await detectives.get(0).emitClient('ChatMessage', winningMessage1);
        expect(chatMessage).toEqual(0);
        expect(wordFound).toEqual(0);
        expect(endGame).toEqual(0);
        expect(endRound).toEqual(0);

        await detectives.get(1).emitClient('ChatMessage', randomMessage);
        expect(chatMessage).toEqual(5);
        expect(wordFound).toEqual(0);
        expect(endGame).toEqual(0);
        expect(endRound).toEqual(0);
        chatMessage = 0;

        await detectives.get(1).emitClient('ChatMessage', winningMessage1);
        await detectives.get(2).emitClient('ChatMessage', winningMessage1);
        expect(chatMessage).toEqual(0);
        expect(wordFound).toEqual(10);
        expect(endGame).toEqual(0);
        expect(endRound).toEqual(5);
        expect(startRound).toEqual(0);
        wordFound = 0;
        endRound = 0;
        artist.remove(artist.get(0));
        detectives = new List(sockets);
        detectives.remove(detectives.get(4));
        expect(startRound).toEqual(0);
        await Sleeper.sleep(6000);
        expect(startRound).toEqual(5);
        expect(artist.length()).toEqual(1);
        expect(artists.length()).toEqual(2);
        expect(detectives.length()).toEqual(3);
        startRound = 0;

        await artist.get(0).emitClient('SetPath', setPathMsg);
        expect(setPath).toEqual(5);
        setPath = 0;

        await artist.get(0).emitClient('AppendToPath', appendToPathMsg);
        expect(appendToPath).toEqual(5);
        appendToPath = 0;

        await detectives.foreach(async det => {
            await det.emitClient('SetPath', setPathMsg);
            await det.emitClient('AppendToPath', appendToPathMsg);
        });
        expect(setPath).toEqual(0);
        expect(appendToPath).toEqual(0);

        await detectives.foreach(async det => {
            await det.emitClient('ChatMessage', randomMessage);
            expect(chatMessage).toEqual(5);
            expect(wordFound).toEqual(0);
            chatMessage = 0;
        });

        const winningMessage2: ChatMessageReceived = {
            content: word,
            roomName: 'Lobby:' + createMsg.gameName,
        }

        await detectives.get(0).emitClient('ChatMessage', winningMessage2);
        expect(chatMessage).toEqual(0);
        expect(wordFound).toEqual(5);
        expect(endGame).toEqual(0);
        expect(endRound).toEqual(0);
        wordFound = 0;

        await detectives.get(0).emitClient('ChatMessage', randomMessage);
        await detectives.get(0).emitClient('ChatMessage', winningMessage2);
        expect(chatMessage).toEqual(0);
        expect(wordFound).toEqual(0);
        expect(endGame).toEqual(0);
        expect(endRound).toEqual(0);
        wordFound = 0;

        await detectives.get(1).emitClient('ChatMessage', randomMessage);
        expect(chatMessage).toEqual(5);
        expect(wordFound).toEqual(0);
        expect(endGame).toEqual(0);
        expect(endRound).toEqual(0);
        chatMessage = 0;

        let leaveGamePlayer = 0;
        let joinGameSpectator = 0;
        let leaveGameSpectator = 0;
        await sockets.foreach(async s => {
            s.onServer('LeaveGamePlayer', async () => {
                leaveGamePlayer += 1;
            });
        });
        await sockets.foreach(async s => {
            s.onServer('JoinGameSpectator', async () => {
                joinGameSpectator += 1;
            });
        });
        await sockets.foreach(async s => {
            s.onServer('LeaveGameSpectator', async () => {
                leaveGameSpectator += 1;
            });
        });

        await detectives.get(1).emitClient('ChatMessage', winningMessage2);
        await detectives.get(2).emitClient('LeaveGamePlayer');
        expect(leaveGamePlayer).toEqual(5);
        expect(endRound).toEqual(4);
        leaveGamePlayer = 0;
        endRound = 0;
        await detectives.get(2).emitClient('JoinGameSpectator', {
            gameName: createMsg.gameName,
        });
        await detectives.get(2).emitClient('JoinGameSpectator', {
            gameName: createMsg.gameName,
        });
        await detectives.get(2).emitClient('LeaveGameSpectator');
        await detectives.get(2).emitClient('JoinGameSpectator', {
            gameName: createMsg.gameName,
        });
        expect(leaveGamePlayer).toEqual(0);
        expect(endRound).toEqual(0);
        expect(chatMessage).toEqual(0);
        expect(wordFound).toEqual(5);
        expect(leaveGameSpectator).toEqual(5);
        expect(joinGameSpectator).toEqual(10);
        expect(endGame).toEqual(0);
        expect(startRound).toEqual(0);
        joinGameSpectator = 0;
        leaveGamePlayer = 0;
        wordFound = 0;
        endRound = 0;
        artist.remove(artist.get(0));
        detectives = new List(sockets);
        detectives.remove(detectives.get(4));
        await Sleeper.sleep(10000);
        expect(startRound).toEqual(5);
        expect(artist.length()).toEqual(1);
        expect(artists.length()).toEqual(3);
        expect(detectives.length()).toEqual(3);
        // startRound = 0;
        // const roundTimeLimit = 70000;
        // await Sleeper.sleep(roundTimeLimit);
        // expect(artists.length()).toEqual(3);
        // expect(endRound).toEqual(5);
        // expect(endGame).toEqual(5);
        // expect(startRound).toEqual(0);
        // endGame = 0;
        // endRound = 0;
        await app.gameService.games.get(0)?.end();
    });
    
    it('should play an FFA game with the artist leaving (2 remain) the artist leaving (1 remains)', async () => {
        const createMsg: LobbyCreateMessageReceived = {
            gameName: 'game',
            gameMode: 'FFA',
            difficulty: 'Normal',
        }

        const joinMsg: LobbyJoinMessageReceived = {
            gameName: 'game',
        }

        await sockets.get(0).emitClient('CreateLobby', createMsg);
        await sockets.get(1).emitClient('JoinLobbyPlayer', joinMsg);
        await sockets.get(2).emitClient('JoinLobbyPlayer', joinMsg);
        
        await sockets.get(0).emitClient('StartGame');
        
        const artist = new List<SocketMock>();
        const artists = new List<SocketMock>();
        const detectives = new List(sockets);
        detectives.remove(detectives.get(4));
        detectives.remove(detectives.get(3));
        await sockets.foreach(async (socket: SocketMock) => {
            socket.onServer('WordToDraw', async () => {
                artist.push(socket);
                artists.remove(socket);
                artists.push(socket);
                detectives.remove(socket);
            });
        });
        await Sleeper.sleep(6000);
        expect(artist.length()).toEqual(1);
        expect(detectives.length()).toEqual(2);
        expect(detectives.has(artist.get(0))).toBeFalsy();

        let endRound = 0;
        await sockets.foreach(async (socket: SocketMock) => {
            socket.onServer('EndRound', async () => {
                endRound += 1;
            });
        });
        let startRound = 0;
        await sockets.foreach(async (socket: SocketMock) => {
            socket.onServer('StartRound', async () => {
                startRound += 1;
            });
        });

        let endGame = 0;
        await sockets.foreach(async (socket: SocketMock) => {
            socket.onServer('EndGame', async () => {
                endGame += 1;
            });
        });

        const firstID = artist.get(0).id;
        await artist.get(0).emitClient('UserLogout');
        expect(endRound).toEqual(2);
        endRound = 0;
        const firstArtist = `user${artist.get(0).id}`;
        expect(app.gameService.gameByUser.get(firstArtist)).toBeUndefined();
        expect(app.gameService.games.get(0).lobby.players.has(firstArtist)).toBeFalsy();
        expect(app.gameService.games.get(0).lobby.participants.has(firstArtist)).toBeFalsy();
        expect(app.gameService.games.get(0).playersWhoHaveDrawn.has(firstArtist)).toBeFalsy();
        artist.remove(artist.get(0));
        await Sleeper.sleep(6000);

        expect(endGame).toEqual(0);
        expect(startRound).toEqual(2);
        expect(artist.get(0).id).not.toEqual(firstID);
        await artist.get(0).emitClient('UserLogout');
        const secondArtist = `user${artist.get(0).id}`;
        expect(endRound).toEqual(1);
        expect(endGame).toEqual(3);
        expect(app.gameService.gameByUser.get(firstArtist)).toBeUndefined();
        expect(app.gameService.gameByUser.get(secondArtist)).toBeUndefined();
        expect(app.gameService.games.get(0)).toBeUndefined();
    });

    it('should play an FFA game with the detective leaving (artist remains)', async () => {
        const createMsg: LobbyCreateMessageReceived = {
            gameName: 'game',
            gameMode: 'FFA',
            difficulty: 'Normal',
        }

        const joinMsg: LobbyJoinMessageReceived = {
            gameName: 'game',
        }

        await sockets.get(0).emitClient('CreateLobby', createMsg);
        await sockets.get(1).emitClient('JoinLobbyPlayer', joinMsg);
        
        await sockets.get(0).emitClient('StartGame');
        
        const artist = new List<SocketMock>();
        const artists = new List<SocketMock>();
        const detectives = new List(sockets);
        detectives.remove(detectives.get(4));
        detectives.remove(detectives.get(3));
        detectives.remove(detectives.get(2));
        await sockets.foreach(async (socket: SocketMock) => {
            socket.onServer('WordToDraw', async () => {
                artist.push(socket);
                artists.remove(socket);
                artists.push(socket);
                detectives.remove(socket);
            });
        });
        await Sleeper.sleep(6000);
        expect(artist.length()).toEqual(1);
        expect(detectives.length()).toEqual(1);
        expect(detectives.has(artist.get(0))).toBeFalsy();

        let endRound = 0;
        await sockets.foreach(async (socket: SocketMock) => {
            socket.onServer('EndRound', async () => {
                endRound += 1;
            });
        });

        let endGame = 0;
        await sockets.foreach(async (socket: SocketMock) => {
            socket.onServer('EndGame', async () => {
                endGame += 1;
            });
        });

        await detectives.get(0).emitClient('UserLogout');
        expect(endRound).toEqual(1);
        expect(endGame).toEqual(4);
        expect(app.gameService.gameByUser.get('user1')).toBeUndefined();
        expect(app.gameService.gameByUser.get('user2')).toBeUndefined();
        expect(app.gameService.games.get(0)).toBeUndefined();
    });

    it('should send game ticks', async () => {
        const createMsg: LobbyCreateMessageReceived = {
            gameName: 'game',
            gameMode: 'FFA',
            difficulty: 'Hard',
        }

        const joinMsg: LobbyJoinMessageReceived = {
            gameName: 'game',
        }

        let GameTick = 0;
        let round = 0;
        sockets.get(0).onServer('GameTick', async () => {
            GameTick += 1;
        });
        sockets.get(1).onServer('GameTick', async () => {
            GameTick += 1;
        });
        sockets.get(0).onServer('EndRound', async () => {
            const seconds = 30;
            const secondesWith0 = seconds + 1;
            const secondsForBothPlayers = 2 * secondesWith0
            expect(GameTick).toEqual(secondsForBothPlayers);
            GameTick = 0;
            round += 1;
        });
        let game = 0;
        sockets.get(0).onServer('EndGame', async () => {
            game += 1;
        });
        sockets.get(1).onServer('EndGame', async () => {
            game += 1;
        });

        await sockets.get(0).emitClient('CreateLobby', createMsg);
        await sockets.get(1).emitClient('JoinLobbyPlayer', joinMsg);
        
        await sockets.get(0).emitClient('StartGame');
        const safetyNet = 10;
        const betweenRounds = 5;
        const roundLength = 30;
        const asMS = 1000;
        const totalGameTime = 2 * (roundLength + betweenRounds + safetyNet) * asMS;
        await Sleeper.sleep(totalGameTime);
        expect(round).toEqual(2);
        expect(game).toEqual(2);
    }, 10000);
});
