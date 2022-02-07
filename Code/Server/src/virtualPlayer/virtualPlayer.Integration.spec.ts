/* eslint-disable max-lines-per-function */
import { DatabaseController } from "../database/DatabaseController";
import { List } from "../List";
import { SocketMock, SocketServerMock } from "../mocks";
import { App } from "../server";
import { Salts } from "../services/network/HTTP/HttpAuthenticatorService";
import { SocketService } from "../services/network/Socket/SocketService";
import { Sleeper } from "../services/Sleeper";
import { LobbyCreateMessageReceived, LobbyJoinMessageReceived } from "../types/game";

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
    await db.init('VirtualPlayer');
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

describe('Virtual Player Integration', () => {
    it('Should let the owner of a lobby add virtual players and kick them and any other player', async () => {
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
        await sockets.get(2).emitClient('JoinLobbySpectator', lobbyJoinMessage);
        await sockets.get(0).emitClient('AddBot');
        const botName = app.gameService.lobbies.get(0).virtualPlayers.get(0).personality.name;
        expect(app.gameService.lobbies.get(0).players.getArray()).toEqual(['user1', 'user2']);
        expect(app.gameService.lobbies.get(0).spectators.getArray()).toEqual(['user3']);
        expect(app.gameService.lobbies.get(0).participants.getArray()).toEqual(['user1', 'user2', 'user3']);
        expect(app.gameService.lobbies.get(0).playersAndVirtualPlayers.getArray()).toEqual(['user1', 'user2', botName]);

        await sockets.get(0).emitClient('KickPlayer', {username: 'user2'});
        expect(app.gameService.lobbies.get(0).players.getArray()).toEqual(['user1']);
        expect(app.gameService.lobbies.get(0).spectators.getArray()).toEqual(['user3']);
        expect(app.gameService.lobbies.get(0).participants.getArray()).toEqual(['user1', 'user3']);
        expect(app.gameService.lobbies.get(0).playersAndVirtualPlayers.getArray()).toEqual(['user1', botName]);

        await sockets.get(0).emitClient('KickPlayer', {username: botName});
        expect(app.gameService.lobbies.get(0).players.getArray()).toEqual(['user1']);
        expect(app.gameService.lobbies.get(0).spectators.getArray()).toEqual(['user3']);
        expect(app.gameService.lobbies.get(0).participants.getArray()).toEqual(['user1', 'user3']);
        expect(app.gameService.lobbies.get(0).playersAndVirtualPlayers.getArray()).toEqual(['user1']);

        await sockets.get(0).emitClient('KickPlayer', {username: 'user3'});
        await sockets.get(0).emitClient('KickPlayer', {username: 'user1'});
        expect(app.gameService.lobbies.get(0).players.getArray()).toEqual(['user1']);
        expect(app.gameService.lobbies.get(0).spectators.getArray()).toEqual(['user3']);
        expect(app.gameService.lobbies.get(0).participants.getArray()).toEqual(['user1', 'user3']);
        expect(app.gameService.lobbies.get(0).playersAndVirtualPlayers.getArray()).toEqual(['user1']);
    });

    it('Should make virtual players draw and end rounds at correct times on guesses', async () => {
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
        await sockets.get(2).emitClient('JoinLobbySpectator', lobbyJoinMessage);
        await sockets.get(0).emitClient('AddBot');
        await sockets.get(0).emitClient('AddBot');
        await sockets.get(0).emitClient('StartGame');
        let set = 0;
        sockets.get(0).onServer('SetPath', async () => {
            set += 1;
        });
        let append = 0;
        sockets.get(0).onServer('AppendToPath', async () => {
            append += 1;
        });
        let round = 0;
        sockets.get(0).onServer('EndRound', async () => {
            round += 1;
        });
        let game = 0;
        sockets.get(0).onServer('EndGame', async () => {
            game += 1;
        });
        const roundTimeToBeSafe = 60000
        await Sleeper.sleep(4 * roundTimeToBeSafe);
        expect(round).toEqual(4);
        expect(game).toEqual(1);
        expect(set).not.toEqual(0);
        expect(append).not.toEqual(0);
    }, 20000);
});
