/* eslint-disable max-lines-per-function */

import { DatabaseController } from "../../database/DatabaseController";
import { List } from "../../List";
import { SocketMock, SocketServerMock } from "../../mocks";
import { App } from "../../server";
import { LobbyCreateMessageReceived, LobbyCreateMessageToSend, LobbyJoinMessageToSend, LobbyJoinMessageReceived, StartRoundMessageToSend, SetPathMessage, AppendToPathMessage, LobbyInfoMessage, UpdateLobbyMessage, WordToDrawMessageToSend } from "../../types/game";
import { RoomJoinToSend, RoomLeaveToSend, ChatMessageReceived, ChatMessageToSend } from "../../types/message";
import { Salts } from "../network/HTTP/HttpAuthenticatorService";
import { SocketService } from "../network/Socket/SocketService";
import { Sleeper } from "../Sleeper";

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
    await db.init('GameService');
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
    sockets = new List<SocketMock>([new SocketMock('1'), new SocketMock('2'), new SocketMock('3')]);
    for (let i = 1; i <= 3; ++i) {
        expect(await app.userController.userExists(`user${i}`)).toBeFalsy();
        const s = sockets.get(i - 1);
        await app.socketService.io.emit('connection', s);
        await signUp(`user${i}`);
        await login(s, `user${i}`);
    }
});

describe('GameService', () => {
    it('should let users login so the other tests work', () => {
        expect(app.userService.userIsLoggedIn('user1')).toBeTruthy();
        expect(app.userService.userIsLoggedIn('user2')).toBeTruthy();
        expect(app.userService.userIsLoggedIn('user3')).toBeTruthy();
    });

    it('should let users create lobbies/associated chats and tell everyone, add them to the lobby/chat and tell only them', async () => {
        const lobbyCreateMessage: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'FFA',
            difficulty: 'Hard',
        };
        
        let s1receivedCreateLobby = false;
        let s2receivedCreateLobby = false;
        let receivedCreateLobby: LobbyCreateMessageToSend = {} as unknown as LobbyCreateMessageToSend;
        let s1receivedCreateRoom = false;
        let s2receivedCreateRoom = false;
        let s1receivedJoinRoom = false;
        let s2receivedJoinRoom = false;
        let receivedJoinRoom: RoomJoinToSend = {} as unknown as RoomJoinToSend;
        let s1receivedJoinLobby = false;
        let s2receivedJoinLobby = false;

        sockets.get(0).onServer('CreateLobby', async () => {
            s1receivedCreateLobby = true;
        });
        sockets.get(1).onServer('CreateLobby', async (msg) => {
            s2receivedCreateLobby = true;
            receivedCreateLobby = msg;
        });
        sockets.get(0).onServer('JoinLobbyPlayer', async () => {
            s1receivedJoinLobby = true;
        });
        sockets.get(1).onServer('JoinLobbyPlayer', async () => {
            s2receivedJoinLobby = true;
        });
        sockets.get(0).onServer('CreateRoom', async () => {
            s1receivedCreateRoom = true;
        });
        sockets.get(1).onServer('CreateRoom', async () => {
            s2receivedCreateRoom = true;
        });
        sockets.get(0).onServer('JoinRoom', async (msg) => {
            s1receivedJoinRoom = true;
            receivedJoinRoom = msg;
        });
        sockets.get(1).onServer('JoinRoom', async () => {
            s2receivedJoinRoom = true;
        });
        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);
        expect(app.roomService.roomExists('Lobby:my lobby')).toBeTruthy();
        expect(s1receivedCreateLobby).toBeTruthy();
        expect(s2receivedCreateLobby).toBeTruthy();
        expect(s1receivedCreateRoom).toBeTruthy();
        expect(s2receivedCreateRoom).toBeTruthy();
        expect(s1receivedJoinLobby).toBeTruthy();
        expect(s2receivedJoinLobby).toBeFalsy();
        expect(s1receivedJoinRoom).toBeTruthy();
        expect(s2receivedJoinRoom).toBeFalsy();
        expect(receivedCreateLobby.difficulty).toEqual(lobbyCreateMessage.difficulty);
        expect(receivedJoinRoom.creator).toEqual('user1');
    });

    it('should let users join lobbies/associated chats and tell everyone, add them to the lobby/chat and tell only users in lobby', async () => {
        const lobbyCreateMessage: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'FFA',
            difficulty: 'Hard',
        };
        let s1NotifiedOfS2JoinRoom = false;
        let s2NotifiedOfS2JoinRoom = false;
        let s3NotifiedOfS2JoinRoom = false;
        sockets.get(0).onServer('JoinRoom', async (msg: RoomJoinToSend) => {
            if (msg.username == 'user2')
                s1NotifiedOfS2JoinRoom = true;
        });
        sockets.get(1).onServer('JoinRoom', async (msg: RoomJoinToSend) => {
            if (msg.username == 'user2')
                s2NotifiedOfS2JoinRoom = true;
        });
        sockets.get(2).onServer('JoinRoom', async (msg: RoomJoinToSend) => {
            if (msg.username == 'user2')
                s3NotifiedOfS2JoinRoom = true;
        });
        let s1NotifiedOfS2JoinLobby = false;
        let s2NotifiedOfS2JoinLobby = false;
        let s3NotifiedOfS2JoinLobby = false;
        sockets.get(0).onServer('JoinLobbyPlayer', async (msg: LobbyJoinMessageToSend) => {
            if (msg.username == 'user2')
                s1NotifiedOfS2JoinLobby = true;
        });
        sockets.get(1).onServer('JoinLobbyPlayer', async (msg: LobbyJoinMessageToSend) => {
            if (msg.username == 'user2')
                s2NotifiedOfS2JoinLobby = true;
        });
        sockets.get(2).onServer('JoinLobbyPlayer', async (msg: LobbyJoinMessageToSend) => {
            if (msg.username == 'user2')
                s3NotifiedOfS2JoinLobby = true;
        });
        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);
        expect(app.roomService.roomExists('Lobby:my lobby')).toBeTruthy();
        expect(s1NotifiedOfS2JoinRoom).toBeFalsy();
        const lobbyJoinMessage: LobbyJoinMessageReceived = {
            gameName: 'my lobby',
        };
        await sockets.get(1).emitClient('JoinLobbyPlayer', lobbyJoinMessage);
        expect(s1NotifiedOfS2JoinRoom).toBeTruthy();
        expect(s2NotifiedOfS2JoinRoom).toBeTruthy();
        expect(s3NotifiedOfS2JoinRoom).toBeFalsy();
        expect(s1NotifiedOfS2JoinLobby).toBeTruthy();
        expect(s2NotifiedOfS2JoinLobby).toBeTruthy();
        expect(s3NotifiedOfS2JoinLobby).toBeFalsy();
    });

    it('should send leave/delete lobby/room to people in lobby for leave, everyone for delete', async () => {
        let s1NotifiedOfS2LeaveRoom = false;
        let s2NotifiedOfS2LeaveRoom = false;
        let s3NotifiedOfS2LeaveRoom = false;
        let s1NotifiedOfS2LeaveLobby = false;
        let s2NotifiedOfS2LeaveLobby = false;
        let s3NotifiedOfS2LeaveLobby = false;
        let s1NotifiedOfDeleteRoom = false;
        let s2NotifiedOfDeleteRoom = false;
        let s3NotifiedOfDeleteRoom = false;
        let s1NotifiedOfDeleteLobby = false;
        let s2NotifiedOfDeleteLobby = false;
        let s3NotifiedOfDeleteLobby = false;

        const resetNotifications = () => {
            s1NotifiedOfS2LeaveRoom = false;
            s2NotifiedOfS2LeaveRoom = false;
            s3NotifiedOfS2LeaveRoom = false;
            s1NotifiedOfS2LeaveLobby = false;
            s2NotifiedOfS2LeaveLobby = false;
            s3NotifiedOfS2LeaveLobby = false;
            s1NotifiedOfDeleteRoom = false;
            s2NotifiedOfDeleteRoom = false;
            s3NotifiedOfDeleteRoom = false;
            s1NotifiedOfDeleteLobby = false;
            s2NotifiedOfDeleteLobby = false;
            s3NotifiedOfDeleteLobby = false;
        }

        const lobbyCreateMessage: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'FFA',
            difficulty: 'Hard',
        };

        const lobbyJoinMessage: LobbyJoinMessageReceived = {
            gameName: 'my lobby',
        };
        sockets.get(0).onServer('LeaveRoom', async (msg: RoomLeaveToSend) => {
            if (msg.username == 'user2')
                s1NotifiedOfS2LeaveRoom = true;
        });
        sockets.get(1).onServer('LeaveRoom', async (msg: RoomLeaveToSend) => {
            if (msg.username == 'user2')
                s2NotifiedOfS2LeaveRoom = true;
        });
        sockets.get(2).onServer('LeaveRoom', async (msg: RoomLeaveToSend) => {
            if (msg.username == 'user2')
                s3NotifiedOfS2LeaveRoom = true;
        });
        sockets.get(0).onServer('LeaveLobbyPlayer', async (msg) => {
            if (msg.username == 'user2')
                s1NotifiedOfS2LeaveLobby = true;
        });
        sockets.get(1).onServer('LeaveLobbyPlayer', async (msg) => {
            if (msg.username == 'user2')
                s2NotifiedOfS2LeaveLobby = true;
        });
        sockets.get(2).onServer('LeaveLobbyPlayer', async (msg) => {
            if (msg.username == 'user2')
                s3NotifiedOfS2LeaveLobby = true;
        });
        sockets.get(0).onServer('DeleteRoom', async () => {
            s1NotifiedOfDeleteRoom = true;
        });
        sockets.get(1).onServer('DeleteRoom', async () => {
            s2NotifiedOfDeleteRoom = true;
        });
        sockets.get(2).onServer('DeleteRoom', async () => {
            s3NotifiedOfDeleteRoom = true;
        });
        sockets.get(0).onServer('DeleteLobby', async () => {
            s1NotifiedOfDeleteLobby = true;
        });
        sockets.get(1).onServer('DeleteLobby', async () => {
            s2NotifiedOfDeleteLobby = true;
        });
        sockets.get(2).onServer('DeleteLobby', async () => {
            s3NotifiedOfDeleteLobby = true;
        });

        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);
        await sockets.get(1).emitClient('JoinLobbyPlayer', lobbyJoinMessage);
        resetNotifications();
        await sockets.get(1).emitClient('LeaveLobbyPlayer');
        expect(s1NotifiedOfS2LeaveRoom).toBeTruthy();
        expect(s2NotifiedOfS2LeaveRoom).toBeTruthy();
        expect(s3NotifiedOfS2LeaveRoom).toBeFalsy();
        expect(s1NotifiedOfS2LeaveLobby).toBeTruthy();
        expect(s2NotifiedOfS2LeaveLobby).toBeTruthy();
        expect(s3NotifiedOfS2LeaveLobby).toBeFalsy();
        await sockets.get(1).emitClient('JoinLobbyPlayer', lobbyJoinMessage);
        resetNotifications();
        await sockets.get(0).emitClient('DeleteLobby');
        expect(s1NotifiedOfDeleteRoom).toBeTruthy();
        expect(s2NotifiedOfDeleteRoom).toBeTruthy();
        expect(s3NotifiedOfDeleteRoom).toBeTruthy();
        expect(s1NotifiedOfDeleteLobby).toBeTruthy();
        expect(s2NotifiedOfDeleteLobby).toBeTruthy();
        expect(s3NotifiedOfDeleteLobby).toBeTruthy();
    });

    it('should send chat messages only to people in the lobby', async () => {
        let s1NotifiedOfChatMessage = false;
        let s2NotifiedOfChatMessage = false;
        let s3NotifiedOfChatMessage = false;

        const resetNotifications = () => {
            s1NotifiedOfChatMessage = false;
            s2NotifiedOfChatMessage = false;
            s3NotifiedOfChatMessage = false;
        }

        const lobbyCreateMessage: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'FFA',
            difficulty: 'Hard',
        };

        const lobbyJoinMessage: LobbyJoinMessageReceived = {
            gameName: 'my lobby',
        };

        const chatMessage: ChatMessageReceived = {
            content: 'SALUT',
            roomName: 'Lobby:' + lobbyCreateMessage.gameName,
        };

        sockets.get(0).onServer('ChatMessage', async () => {
            s1NotifiedOfChatMessage = true;
        });

        sockets.get(1).onServer('ChatMessage', async () => {
            s2NotifiedOfChatMessage = true;
        });

        sockets.get(2).onServer('ChatMessage', async () => {
            s3NotifiedOfChatMessage = true;
        });

        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);
        await sockets.get(1).emitClient('JoinLobbyPlayer', lobbyJoinMessage);
        resetNotifications();
        await sockets.get(1).emitClient('ChatMessage', chatMessage);
        expect(s1NotifiedOfChatMessage).toBeTruthy();
        expect(s2NotifiedOfChatMessage).toBeTruthy();
        expect(s3NotifiedOfChatMessage).toBeFalsy();
        resetNotifications();
        await sockets.get(0).emitClient('ChatMessage', chatMessage);
        expect(s1NotifiedOfChatMessage).toBeTruthy();
        expect(s2NotifiedOfChatMessage).toBeTruthy();
        expect(s3NotifiedOfChatMessage).toBeFalsy();
        resetNotifications();
        await sockets.get(1).emitClient('LeaveLobbyPlayer');
        resetNotifications();
        await sockets.get(0).emitClient('ChatMessage', chatMessage);
        expect(s1NotifiedOfChatMessage).toBeTruthy();
        expect(s2NotifiedOfChatMessage).toBeFalsy();
        expect(s3NotifiedOfChatMessage).toBeFalsy();
    });

    it('should delete lobbies/rooms on disconnect if owner', async () => {
        const lobbyCreateMessage: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'FFA',
            difficulty: 'Hard',
        };

        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);
        expect(app.roomService.rooms.has('Lobby:my lobby')).toBeTruthy();
        expect(app.gameService.lobbies.find(l => l.gameName == 'my lobby')).toBeDefined();
        await sockets.get(0).emitClient('UserLogout');
        expect(app.roomService.rooms.has('Lobby:my lobby')).toBeFalsy();
        expect(app.gameService.lobbies.find(l => l.gameName == 'my lobby')).toBeUndefined();
    });

    it('should leave lobbies/rooms on disconnect', async () => {
        const lobbyCreateMessage: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'FFA',
            difficulty: 'Hard',
        };

        const lobbyJoinMessage: LobbyJoinMessageReceived = {
            gameName: 'my lobby',
        };

        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);
        await sockets.get(1).emitClient('JoinLobbyPlayer', lobbyJoinMessage);
        expect(app.roomService.rooms.has('Lobby:my lobby')).toBeTruthy();
        expect(app.gameService.lobbies.find(l => l.gameName == 'my lobby')).toBeDefined();
        expect(app.gameService.lobbyByUser.get('user2')).toBeDefined();
        expect(app.gameService.lobbyByUser.get('user1')).toBeDefined();
        await sockets.get(1).emitClient('UserLogout');
        expect(app.roomService.rooms.has('Lobby:my lobby')).toBeTruthy();
        expect(app.gameService.lobbies.find(l => l.gameName == 'my lobby')).toBeDefined();
        expect(app.gameService.lobbyByUser.get('user2')).toBeUndefined();
        expect(app.gameService.lobbyByUser.get('user1')).toBeDefined();
    });

    it('should let the creator start game', async () => {
        const lobbyCreateMessage: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'FFA',
            difficulty: 'Hard',
        };

        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);

        let gameStarted = false;

        sockets.get(0).onServer('StartGame', async () => {
            gameStarted = true;
        });

        await sockets.get(0).emitClient('StartGame');
        expect(gameStarted).toBeFalsy();
        const msg: LobbyJoinMessageReceived = {
            gameName: lobbyCreateMessage.gameName,
        }
        await sockets.get(1).emitClient('JoinLobbyPlayer', msg);
        await sockets.get(0).emitClient('StartGame');
        expect(gameStarted).toBeTruthy();
        Sleeper.sleep(100)
        await app.gameService.games.get(0).end();
    });

    it('should start a round after 5 seconds', async () => {
        const lobbyCreateMessage: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'FFA',
            difficulty: 'Hard',
        };

        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);

        let gameStarted = false;

        sockets.get(0).onServer('StartGame', async () => {
            gameStarted = true;
        });
        const msg: LobbyJoinMessageReceived = {
            gameName: lobbyCreateMessage.gameName,
        }
        await sockets.get(1).emitClient('JoinLobbyPlayer', msg);
        await sockets.get(0).emitClient('StartGame');
        expect(gameStarted).toBeTruthy();

        let roundStarted = false;
        sockets.get(0).onServer('StartRound', async () => {
            roundStarted = true;
        });

        await Sleeper.sleep(6000);
        expect(roundStarted).toBeTruthy();
        await app.gameService.games.get(0).end();
    });

    it('should start a round after 5 seconds and give the word to the artist', async () => {
        const lobbyCreateMessage: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'FFA',
            difficulty: 'Hard',
        };
        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);
        let gameStarted = false;

        sockets.get(0).onServer('StartGame', async () => {
            gameStarted = true;
        });
        const msg: LobbyJoinMessageReceived = {
            gameName: lobbyCreateMessage.gameName,
        }
        await sockets.get(1).emitClient('JoinLobbyPlayer', msg);
        await sockets.get(0).emitClient('StartGame');
        expect(gameStarted).toBeTruthy();

        let roundStarted = false;
        let s0received = false;
        let s1received = false;
        let receiver = 'nobody';
        let artist = '';
        sockets.get(0).onServer('StartRound', async (msg: StartRoundMessageToSend) => {
            roundStarted = true;
            artist = msg.artist;
        });
        sockets.get(0).onServer('WordToDraw', async () => {
            s0received = true;
            receiver = 'user1';
        });
        sockets.get(1).onServer('WordToDraw', async () => {
            s1received = true;
            receiver = 'user2';
        });

        await Sleeper.sleep(6000);
        expect(roundStarted).toBeTruthy();
        expect(s0received && s1received).toBeFalsy();
        expect(s0received || s1received).toBeTruthy();
        expect(artist).toEqual(receiver);
        await app.gameService.games.get(0).end();
    });

    it('should let the artist draw and not the detectives', async () => {
        const lobbyCreateMessage: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'FFA',
            difficulty: 'Hard',
        };
        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);
        let gameStarted = false;

        sockets.get(0).onServer('StartGame', async () => {
            gameStarted = true;
        });
        const msg: LobbyJoinMessageReceived = {
            gameName: lobbyCreateMessage.gameName,
        }
        await sockets.get(1).emitClient('JoinLobbyPlayer', msg);
        await sockets.get(0).emitClient('StartGame');
        expect(gameStarted).toBeTruthy();

        let roundStarted = false;
        let s0received = false;
        let s1received = false;
        let artist: SocketMock = sockets.get(2);
        let detective: SocketMock = sockets.get(2);

        sockets.get(0).onServer('StartRound', async () => {
            roundStarted = true;
        });
        sockets.get(0).onServer('WordToDraw', async () => {
            s0received = true;
            artist = sockets.get(0);
            detective = sockets.get(1);
        });
        sockets.get(1).onServer('WordToDraw', async () => {
            s1received = true;
            artist = sockets.get(1);
            detective = sockets.get(0);
        });

        await Sleeper.sleep(6000);
        expect(roundStarted).toBeTruthy();
        expect(s0received && s1received).toBeFalsy();
        expect(s0received || s1received).toBeTruthy();

        const setPathMsg: SetPathMessage = {
            pathId: 0,
            path: '123 123 123 123',
            color: '#FFFFFF',
            canvasSize: 600,
            strokeWidth: 20,
        }

        const appendMsg: AppendToPathMessage = {
            x: 1,
            y: 99,
        }

        let detectiveReceivedSet = false;
        detective.onServer('SetPath', async () => {
            detectiveReceivedSet = true;
        });

        let detectiveReceivedAppend = false;
        detective.onServer('AppendToPath', async () => {
            detectiveReceivedAppend = true;
        });

        let artistReceivedSet = false;
        artist.onServer('SetPath', async () => {
            artistReceivedSet = true;
        });

        let artistReceivedAppend = false;
        artist.onServer('AppendToPath', async () => {
            artistReceivedAppend = true;
        });

        await artist.emitClient('SetPath', setPathMsg);
        await artist.emitClient('AppendToPath', appendMsg);

        expect(detectiveReceivedSet).toBeTruthy();
        expect(detectiveReceivedAppend).toBeTruthy();
        expect(artistReceivedSet).toBeTruthy();
        expect(artistReceivedAppend).toBeTruthy();
        detectiveReceivedAppend = false;
        detectiveReceivedSet = false;
        artistReceivedAppend = false;
        artistReceivedSet = false;

        await detective.emitClient('SetPath', setPathMsg);
        await detective.emitClient('AppendToPath', appendMsg);

        expect(detectiveReceivedSet).toBeFalsy();
        expect(detectiveReceivedAppend).toBeFalsy();
        expect(artistReceivedSet).toBeFalsy();
        expect(artistReceivedAppend).toBeFalsy();
        await app.gameService.games.get(0).end();
    });

    it('should let the people who join a lobby know the LobbyInfo and leave and tell the others in the lobby and update everyone with the new player count and not let the creator leave but delete', async () => {
        const lobbyCreateMessage: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'FFA',
            difficulty: 'Hard',
        };

        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);
        expect(app.gameService.lobbies.get(0).players.length()).toEqual(1);

        const msg: LobbyJoinMessageReceived = {
            gameName: lobbyCreateMessage.gameName,
        }

        await sockets.get(1).emitClient('JoinLobbyPlayer', msg);
        expect(app.gameService.lobbies.get(0).players.length()).toEqual(2);
        expect(app.gameService.lobbyByUser.get('user1')?.gameName).toEqual(lobbyCreateMessage.gameName);
        expect(app.gameService.lobbyByUser.get('user2')?.gameName).toEqual(lobbyCreateMessage.gameName);

        await sockets.get(0).emitClient('LeaveLobbyPlayer');
        expect(app.gameService.lobbies.get(0).players.length()).toEqual(2);
        expect(app.gameService.lobbyByUser.get('user1')?.gameName).toEqual(lobbyCreateMessage.gameName);
        expect(app.gameService.lobbyByUser.get('user2')?.gameName).toEqual(lobbyCreateMessage.gameName);

        let user1KnowsUser2Left = false;
        sockets.get(0).onServer('LeaveLobbyPlayer', async () => {
            user1KnowsUser2Left = true;
        });

        await sockets.get(1).emitClient('LeaveLobbyPlayer');
        expect(app.gameService.lobbies.get(0).players.length()).toEqual(1);
        expect(app.gameService.lobbyByUser.get('user1')?.gameName).toEqual(lobbyCreateMessage.gameName);
        expect(app.gameService.lobbyByUser.get('user2')).toBeUndefined();
        expect(user1KnowsUser2Left).toBeTruthy();

        let user1KnowsUser2joined = false;
        sockets.get(0).onServer('JoinLobbyPlayer', async (msg: LobbyJoinMessageToSend) => {
            expect(msg.gameName).toEqual(lobbyCreateMessage.gameName);
            user1KnowsUser2joined = true;
        });

        let user1GotInfoWhenUser2Joined = false;
        let user2GotInfoWhenUser2Joined = false;
        let receivedInfo: LobbyInfoMessage = undefined as unknown as LobbyInfoMessage;
        sockets.get(0).onServer('LobbyInfo', async () => {
            user1GotInfoWhenUser2Joined = true;
        });
        sockets.get(1).onServer('LobbyInfo', async (msg: LobbyInfoMessage) => {
            receivedInfo = msg;
            user2GotInfoWhenUser2Joined = true;
        });

        let user1GotUpdateWhenUser2Joined = false;
        let receivedUpdate: UpdateLobbyMessage = undefined as unknown as UpdateLobbyMessage;
        sockets.get(0).onServer('UpdateLobby', async () => {
            user1GotUpdateWhenUser2Joined = true;
        });
        let user2GotUpdateWhenUser2Joined = false;
        sockets.get(1).onServer('UpdateLobby', async () => {
            user2GotUpdateWhenUser2Joined = true;
        });
        let user3GotUpdateWhenUser2Joined = false;
        sockets.get(2).onServer('UpdateLobby', async (msg: UpdateLobbyMessage) => {
            receivedUpdate = msg;
            user3GotUpdateWhenUser2Joined = true;
        });

        expect(app.gameService.lobbies.get(0).players.length()).toEqual(1);
        await sockets.get(1).emitClient('JoinLobbyPlayer', msg);
        expect(app.gameService.lobbies.get(0).players.length()).toEqual(2);
        expect(receivedUpdate.playerCount).toEqual(2);
        expect(app.gameService.lobbyByUser.get('user1')?.gameName).toEqual(lobbyCreateMessage.gameName);
        expect(app.gameService.lobbyByUser.get('user2')?.gameName).toEqual(lobbyCreateMessage.gameName);
        expect(user1KnowsUser2joined);
        expect(user1GotInfoWhenUser2Joined).toBeFalsy();
        expect(user2GotInfoWhenUser2Joined).toBeTruthy();
        expect(receivedInfo.players).toEqual([{username: 'user1', avatar: 1}, {username: 'user2', avatar: 2}]);
        expect(receivedInfo.spectators).toEqual([]);
        expect(user1GotUpdateWhenUser2Joined).toBeTruthy();
        expect(user2GotUpdateWhenUser2Joined).toBeTruthy();
        expect(user3GotUpdateWhenUser2Joined).toBeTruthy();
        expect(receivedUpdate.gameName).toEqual(lobbyCreateMessage.gameName);
        expect(app.gameService.lobbies.get(0).players.length()).toEqual(2);

        let user2KnowsUser1DeletedLobby = false;
        sockets.get(1).onServer('DeleteLobby', async () => {
            user2KnowsUser1DeletedLobby = true;
        });

        await sockets.get(0).emitClient('DeleteLobby');
        expect(app.gameService.lobbyByUser.get('user1')).toBeUndefined();
        expect(user2KnowsUser1DeletedLobby).toBeTruthy();
    });

    it('should let detectives guess', async () => {
        const lobbyCreateMessage: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'FFA',
            difficulty: 'Hard',
        };
        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);
        let gameStarted = false;

        sockets.get(0).onServer('StartGame', async () => {
            gameStarted = true;
        });
        const msg: LobbyJoinMessageReceived = {
            gameName: lobbyCreateMessage.gameName,
        }

        const detectives: List<SocketMock> = new List();

        sockets.get(0).onServer('StartRound', async (msg: StartRoundMessageToSend) => {
            switch (msg.artist) {
                case 'user1':
                    detectives.push(sockets.get(1));
                    detectives.push(sockets.get(2));
                    break;
                case 'user2':
                    detectives.push(sockets.get(0));
                    detectives.push(sockets.get(2));
                    break;
                case 'user3':
                    detectives.push(sockets.get(0));
                    detectives.push(sockets.get(1));
                    break;
            }
        });

        await sockets.get(1).emitClient('JoinLobbyPlayer', msg);
        await sockets.get(2).emitClient('JoinLobbyPlayer', msg);
        await sockets.get(0).emitClient('StartGame');

        expect(gameStarted).toBeTruthy();

        await Sleeper.sleep(6000);    
        const WordFoundNotified = [false, false, false];
        for (let i = 0; i < 3; ++i) {
            sockets.get(i).onServer('WordFound', async () => {
                WordFoundNotified[i] = true;
            });
        }
        
        await detectives.get(0).emitClient('ChatMessage', { content: 'Not a word to draw', roomName: 'Lobby:' + lobbyCreateMessage.gameName });
        expect(WordFoundNotified).toEqual([false, false, false]);

        await detectives.get(1).emitClient('ChatMessage', { content: app.gameService.gameByUser.get('user1')?.currentWord, roomName: 'Lobby:' + lobbyCreateMessage.gameName });
        expect(WordFoundNotified).toEqual([true, true, true]);
        await app.gameService.games.get(0).end();
    });
    
    it('Should let spectators join lobbies, tell people, let them spectate the game', async () => {
        const lobbyCreateMessage: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'FFA',
            difficulty: 'Easy',
        };
        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);

        const lobbyJoinMessage: LobbyJoinMessageReceived = {
            gameName: lobbyCreateMessage.gameName,
        };

        const joinPlayer = [false, false, false];
        for (let i = 0; i < 3; ++i) {
            sockets.get(i).onServer('JoinLobbyPlayer', async () => {
                joinPlayer[i] = true;
            });
        }

        await sockets.get(1).emitClient('JoinLobbyPlayer', lobbyJoinMessage);
        expect(joinPlayer).toEqual([true, true, false]);
        
        const joinSpectator = [false, false, false];
        for (let i = 0; i < 3; ++i) {
            sockets.get(i).onServer('JoinLobbySpectator', async () => {
                joinSpectator[i] = true;
            });
        }

        const spectator = sockets.get(2);

        await spectator.emitClient('JoinLobbySpectator', lobbyJoinMessage);
        expect(joinSpectator).toEqual([true, true, true]);
        expect(app.gameService.lobbies.get(0).spectators.has('user3')).toBeTruthy();

        let ChatMessage = [
            [false, false, false],
            [false, false, false],
            [false, false, false],
        ];

        for (let i = 0; i < 3; ++i) {
            sockets.get(i).onServer('ChatMessage', async (msg: ChatMessageToSend) => {
                const user = parseInt(msg.author[msg.author.length - 1]) - 1;
                ChatMessage[i][user] = true;
            });
        }

        for (let i = 0; i < 3; ++i) {
            const chatMsg: ChatMessageReceived = {
                content: `Hi im player${i}`,
                roomName: 'Lobby:' + lobbyCreateMessage.gameName,
            }
            await sockets.get(i).emitClient('ChatMessage', chatMsg);
        }
        expect(ChatMessage).toEqual([
            [true, true, true],
            [true, true, true],
            [true, true, true],
        ]);

        const startGame = [false, false, false];
        for (let i = 0; i < 3; ++i) {
            sockets.get(i).onServer('StartGame', async () => {
                startGame[i] = true;
            });
        }

        await sockets.get(0).emitClient('StartGame');
        expect(startGame).toEqual([true, true, true]);

        const artist: List<SocketMock> = new List();
        const detectives: List<SocketMock> = new List();

        sockets.get(0).onServer('StartRound', async (msg: StartRoundMessageToSend) => {
            const user = parseInt(msg.artist[msg.artist.length - 1]) - 1;
            artist.push(sockets.get(user));
            detectives.push(sockets.get(0));
            detectives.push(sockets.get(1));
            detectives.remove(artist.get(0));
        });

        await Sleeper.sleep(6000);
        expect(artist.length()).toEqual(1);
        expect(detectives.length()).toEqual(1);
        expect(detectives.has(artist.get(0))).toBeFalsy();
        expect(artist.get(0) == sockets.get(0) || artist.get(0) == sockets.get(1)).toBeTruthy();
        expect(detectives.get(0) == sockets.get(0) || detectives.get(0) == sockets.get(1)).toBeTruthy();
        expect(detectives.get(0) == artist.get(0)).toBeFalsy();
        expect(detectives.has(spectator)).toBeFalsy();
        expect(artist.has(spectator)).toBeFalsy();

        ChatMessage = [
            [false, false, false],
            [false, false, false],
            [false, false, false],
        ];

        for (let i = 0; i < 3; ++i) {
            const chatMsg: ChatMessageReceived = {
                content: `Hi im player${i}`,
                roomName: 'Lobby:' + lobbyCreateMessage.gameName,
            }
            await sockets.get(i).emitClient('ChatMessage', chatMsg);
        }

        expect([
            [
                [false, true, false],
                [false, true, false],
                [false, true, false],
            ], [
                [true, false, false],
                [true, false, false],
                [true, false, false],
            ]
        ]).toContainEqual(ChatMessage);

        const setPathMsg: SetPathMessage = {
            pathId: 0,
            path: '123 123 123 123',
            color: '#FFFFFF',
            canvasSize: 600,
            strokeWidth: 20,
        }

        const setReceived = [false, false, false];
        for (let i = 0; i < 3; ++i) {
            sockets.get(i).onServer('SetPath', async () => {
                setReceived[i] = true;
            });
        }

        await artist.get(0).emitClient('SetPath', setPathMsg);
        expect(setReceived).toEqual([true, true, true]);

        const appendMsg: AppendToPathMessage = {
            x: 155,
            y: 166,
        }

        const appendReceived = [false, false, false];
        for (let i = 0; i < 3; ++i) {
            sockets.get(i).onServer('AppendToPath', async () => {
                appendReceived[i] = true;
            });
        }

        await artist.get(0).emitClient('AppendToPath', appendMsg);
        expect(appendReceived).toEqual([true, true, true]);

        const correctWord = app.gameService.games.get(0).currentWord;

        const WordFoundNotified = [false, false, false];
        for (let i = 0; i < 3; ++i) {
            sockets.get(i).onServer('WordFound', async () => {
                WordFoundNotified[i] = true;
            });
        }

        const winningChatMsg: ChatMessageReceived = {
            content: correctWord,
            roomName: 'Lobby:' + lobbyCreateMessage.gameName,
        }

        const anyChatMsg: ChatMessageReceived = {
            content: correctWord + ' nevermind',
            roomName: 'Lobby:' + lobbyCreateMessage.gameName,
        }

        ChatMessage = [
            [false, false, false],
            [false, false, false],
            [false, false, false],
        ];

        await spectator.emitClient('ChatMessage', anyChatMsg);
        expect(ChatMessage).toEqual([
            [false, false, false],
            [false, false, false],
            [false, false, false],
        ]);

        await artist.get(0).emitClient('ChatMessage', anyChatMsg);
        expect(ChatMessage).toEqual([
            [false, false, false],
            [false, false, false],
            [false, false, false],
        ]);

        await detectives.get(0).emitClient('ChatMessage', anyChatMsg);

        expect([
            [
                [false, true, false],
                [false, true, false],
                [false, true, false],
            ], [
                [true, false, false],
                [true, false, false],
                [true, false, false],
            ], [
                [false, false, true],
                [false, false, true],
                [false, false, true],
            ]
        ]).toContainEqual(ChatMessage);

        ChatMessage = [
            [false, false, false],
            [false, false, false],
            [false, false, false],
        ];

        await spectator.emitClient('ChatMessage', winningChatMsg);
        expect(WordFoundNotified).toEqual([false, false, false]);
        expect(ChatMessage).toEqual([
            [false, false, false],
            [false, false, false],
            [false, false, false],
        ]);

        await artist.get(0).emitClient('ChatMessage', winningChatMsg);
        expect(WordFoundNotified).toEqual([false, false, false]);
        expect(ChatMessage).toEqual([
            [false, false, false],
            [false, false, false],
            [false, false, false],
        ]);

        await detectives.get(0).emitClient('ChatMessage', winningChatMsg);
        expect(WordFoundNotified).toEqual([true, true, true]);
        expect(ChatMessage).toEqual([
            [false, false, false],
            [false, false, false],
            [false, false, false],
        ]);
        await app.gameService.games.get(0).end();
    });

    it('Should delete the lobby when the owner logs out', async () => {
        const lobbyCreateMessage: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'BR',
            difficulty: 'Easy',
        };
        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);
 
        let deleteLobby = false;
        sockets.get(1).onServer('DeleteLobby', async () => {
            deleteLobby = true;
        });
 
        expect(app.roomService.rooms.has('Lobby:' + lobbyCreateMessage.gameName)).toBeTruthy();
        expect(app.roomController.roomExists('Lobby:' + lobbyCreateMessage.gameName)).toBeTruthy();
        await sockets.get(0).emitClient('UserLogout');
 
        expect(deleteLobby).toBeTruthy();
        expect(app.roomService.rooms.has('Lobby:' + lobbyCreateMessage.gameName)).toBeFalsy();
        expect(await app.roomController.roomExists('Lobby:' + lobbyCreateMessage.gameName)).toBeFalsy();
    });

    it('Should leave lobby on logout so you can join on login', async () => {
        const lobbyCreateMessage: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'BR',
            difficulty: 'Easy',
        };

        const lobbyJoinMessage: LobbyJoinMessageReceived = {
            gameName: lobbyCreateMessage.gameName,
        };
        let leavePlayer = 0;
        let leaveSpectator = 0;
        sockets.foreach(async socket => {
            socket.onServer('LeaveLobbyPlayer', async () => {
                leavePlayer += 1;
            });
            socket.onServer('LeaveLobbySpectator', async () => {
                leaveSpectator += 1;
            });
        })
        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);
        let received: any = '';
        await app.httpService.httpRoomService.roomMessageHistoryRequest({
            query: {
                roomName: 'Lobby:' + lobbyCreateMessage.gameName,
            }
        }, {
            status: (x: number) => {
                expect(x).toEqual(200);
                return {
                    json: (json: any) => {
                        received = json.messageHistory;
                    }
                }
            }
        });
        expect(received).toEqual([]);
        await sockets.get(0).emitClient('ChatMessage', {
            roomName: 'Lobby:' + lobbyCreateMessage.gameName,
            content: 'hello',
        })
        await app.httpService.httpRoomService.roomMessageHistoryRequest({
            query: {
                roomName: 'Lobby:' + lobbyCreateMessage.gameName,
            }
        }, {
            status: (x: number) => {
                expect(x).toEqual(200);
                return {
                    json: (json: any) => {
                        received = json.messageHistory;
                    }
                }
            }
        });
        expect(received[0]['author']).toEqual('user1');
        expect(received[0]['content']).toEqual('hello');
        await sockets.get(1).emitClient('JoinLobbyPlayer', lobbyJoinMessage);
        await sockets.get(2).emitClient('JoinLobbySpectator', lobbyJoinMessage);
        expect(app.gameService.lobbyByUser.get('user1')).toBeDefined();
        expect(app.gameService.lobbyByUser.get('user2')).toBeDefined();
        expect(app.gameService.lobbyByUser.get('user3')).toBeDefined();
        expect(app.gameService.lobbies.get(0).players.has('user1')).toBeTruthy();
        expect(app.gameService.lobbies.get(0).players.has('user2')).toBeTruthy();
        expect(app.gameService.lobbies.get(0).spectators.has('user3')).toBeTruthy();
        expect(app.gameService.lobbyByUser.get('user2')).toBeDefined();
        expect(app.gameService.lobbyByUser.get('user3')).toBeDefined();
        await sockets.get(1).emitClient('UserLogout');
        expect(leavePlayer).toEqual(2);
        expect(leaveSpectator).toEqual(0);
        await sockets.get(2).emitClient('UserLogout');
        expect(leaveSpectator).toEqual(1);
        expect(app.gameService.lobbyByUser.get('user1')).toBeDefined();
        expect(app.gameService.lobbyByUser.get('user2')).toBeUndefined();
        expect(app.gameService.lobbyByUser.get('user3')).toBeUndefined();
        expect(app.gameService.lobbies.get(0).players.has('user1')).toBeTruthy();
        expect(app.gameService.lobbies.get(0).players.has('user2')).toBeFalsy();
        expect(app.gameService.lobbies.get(0).spectators.has('user3')).toBeFalsy();
        expect(app.gameService.lobbyByUser.get('user2')).toBeUndefined();
        expect(app.gameService.lobbyByUser.get('user3')).toBeUndefined();

        let works1 = false;
        sockets.get(0).onServer('JoinLobbyPlayer', async () => {
            works1 = true;
        });
        await login(sockets.get(1), 'user2');
        await sockets.get(1).emitClient('JoinLobbyPlayer', lobbyJoinMessage);
        expect(works1).toBeTruthy();

        let works2 = false;
        sockets.get(0).onServer('JoinLobbySpectator', async () => {
            works2 = true;
        });
        await login(sockets.get(2), 'user3');
        await sockets.get(2).emitClient('JoinLobbySpectator', lobbyJoinMessage);
        expect(works2).toBeTruthy();

        await sockets.get(1).emitClient('LeaveLobbyPlayer');
        await sockets.get(2).emitClient('LeaveLobbySpectator');

        expect(app.gameService.lobbyByUser.get('user1')).toBeDefined();
        expect(app.gameService.lobbyByUser.get('user2')).toBeUndefined();
        expect(app.gameService.lobbyByUser.get('user3')).toBeUndefined();
        expect(app.gameService.lobbies.get(0).players.has('user1')).toBeTruthy();
        expect(app.gameService.lobbies.get(0).players.has('user2')).toBeFalsy();
        expect(app.gameService.lobbies.get(0).spectators.has('user3')).toBeFalsy();
        expect(app.gameService.lobbyByUser.get('user2')).toBeUndefined();
        expect(app.gameService.lobbyByUser.get('user3')).toBeUndefined();
    });

    it('should not create a lobby twice', async () => {
        const lobbyCreateMessage: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'BR',
            difficulty: 'Easy',
        };

        let count = 0;

        sockets.get(0).onServer('CreateLobby', async () => {
            count += 1;
        });

        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);
        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);
        await sockets.get(1).emitClient('CreateLobby', lobbyCreateMessage);

        expect(count).toEqual(1);

        const lobbyJoinMessage: LobbyJoinMessageReceived = {
            gameName: lobbyCreateMessage.gameName,
        };

        await sockets.get(1).emitClient('JoinLobbyPlayer', lobbyJoinMessage);

        await sockets.get(0).emitClient('StartGame');
        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);
        await sockets.get(2).emitClient('CreateLobby', lobbyCreateMessage);

        expect(count).toEqual(1);
        expect(app.roomService.rooms.has('Lobby:my lobby')).toBeTruthy();
        await app.gameService.games.get(0).end();
        expect(app.roomService.rooms.has('Lobby:my lobby')).toBeFalsy();
    });

    it('should not create a lobby because of invalid parameters', async () => {
        const lobbyCreateMessage1: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'BR',
            difficulty: 'INVALID DIFFICULTY',
        };
        const lobbyCreateMessage2: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'FFA',
            difficulty: 'INVALID DIFFICULTY',
        };
        const lobbyCreateMessage3: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'INVALID GAMEMODE',
            difficulty: 'Easy',
        };
        const lobbyCreateMessage4: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'INVALID GAMEMODE',
            difficulty: 'Normal',
        };
        const lobbyCreateMessage5: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'INVALID GAMEMODE',
            difficulty: 'Hard',
        };

        let count = 0;

        sockets.get(0).onServer('CreateLobby', async () => {
            count += 1;
        });

        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage1);
        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage2);
        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage3);
        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage4);
        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage5);

        expect(count).toEqual(0);
    });

    it('should not start game', async () => {
        const lobbyCreateMessage: LobbyCreateMessageReceived = {
            gameName: 'my lobby',
            gameMode: 'BR',
            difficulty: 'Easy',
        };

        const lobbyJoinMessage: LobbyJoinMessageReceived = {
            gameName: lobbyCreateMessage.gameName,
        };

        let count = 0;

        sockets.get(0).onServer('StartGame', async () => {
            count += 1;
        });

        await sockets.get(0).emitClient('StartGame');
        await sockets.get(0).emitClient('CreateLobby', lobbyCreateMessage);
        await sockets.get(1).emitClient('JoinLobbyPlayer', lobbyJoinMessage);
        await sockets.get(1).emitClient('StartGame');
        expect(count).toEqual(0);
    });

    it('should not join a lobby', async () => {
        let count = 0;

        sockets.get(0).onServer('JoinLobbyPlayer', async () => {
            count += 1;
        });
        sockets.get(1).onServer('JoinLobbySpectator', async () => {
            count += 1;
        });

        const lobbyJoinMessage: LobbyJoinMessageReceived = {
            gameName: 'my lobby',
        };

        await sockets.get(0).emitClient('JoinLobbyPlayer', lobbyJoinMessage)
        await sockets.get(1).emitClient('JoinLobbySpectator', lobbyJoinMessage);

        expect(count).toEqual(0);
    });

    it('should not add paths', async () => {
        let count = 0;

        sockets.get(0).onServer('SetPath', async () => {
            count += 1;
        });
        sockets.get(0).onServer('AppendToPath', async () => {
            count += 1;
        });
        sockets.get(0).emitClient('SetPath', {});
        sockets.get(0).emitClient('AppendToPath', {});
        expect(count).toEqual(0);
    });

    it('should emit an already logged in message on duplicate login', async () => {
        let receivedError = false;
        sockets.get(0).onServer('UserAlreadyLoggedInError', async () => {
            receivedError = true;
        });
        await login(sockets.get(0), 'user1');
        expect(receivedError).toBeTruthy();
    });

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

        await detective.emitClient('ChatMessage', {content: wordtodraw, roomName: 'Lobby:' + lobbyCreateMessage.gameName } as ChatMessageReceived);
    
        expect(eliminated).toEqual([true, true, true])

        await app.gameService.games.get(0)?.end();
    });
});
