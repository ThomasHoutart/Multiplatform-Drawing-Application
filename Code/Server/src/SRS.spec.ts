/* eslint-disable max-lines-per-function */

import { DatabaseController } from './database/DatabaseController';
import { List } from './List';
import { SocketMock, SocketServerMock } from './mocks';
import { App } from './server';
import { Salts } from './services/network/HTTP/HttpAuthenticatorService';
import { SocketService } from './services/network/Socket/SocketService';
import { Sleeper } from './services/Sleeper';
import { RoomJoinToSend } from './types/message';

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
    await db.init('SRS');
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

describe('SRS', () => {
    it('3.1.1 Should add every user to general on login', () => {
        expect(app.roomService.getRoomsByUsername('user1').has('General')).toBeTruthy();
        expect(app.roomService.getRoomsByUsername('user2').has('General')).toBeTruthy();
        expect(app.roomService.getRoomsByUsername('user3').has('General')).toBeTruthy();
        expect(app.roomService.getusersByRoomName('General').getArray()).toEqual(['user1', 'user2', 'user3']);
    });

    it('3.1.2 Should add a user to the game\'s chat room when joining a lobby', async () => {
        let passes1 = false;
        sockets.get(0).onServer('JoinRoom', async (msg: RoomJoinToSend) => {
            passes1 = true;
            passes1 = passes1 && msg.creator == 'user1';
            passes1 = passes1 && msg.roomName == 'Lobby:any name';
            passes1 = passes1 && msg.username == 'user1';
        });
        await sockets.get(0).emitClient('CreateLobby', {
            gameName: 'any name',
            gameMode: 'FFA',
            difficulty: 'Hard',
        });
        expect(passes1).toBeTruthy();

        let passes2 = false;
        sockets.get(1).onServer('JoinRoom', async (msg: RoomJoinToSend) => {
            passes2 = true;
            passes2 = passes2 && msg.creator == 'user1';
            passes2 = passes2 && msg.roomName == 'Lobby:any name';
            passes2 = passes2 && msg.username == 'user2';
        });
        await sockets.get(1).emitClient('JoinLobbyPlayer', {
            gameName: 'any name',
        });
        expect(passes2).toBeTruthy();
    });

    it('should not let a user login when the client says he cheated', async () => {
        expect(app.userService.userIsLoggedIn('user1')).toBeTruthy();
        let clientKnows = false;
        sockets.get(0).onServer('UserCheatedError', async () => {
            clientKnows = true;
        });

        await sockets.get(0).emitClient('UserCheated');
        expect(app.userService.userIsLoggedIn('user1')).toBeTruthy();
        expect(clientKnows).toBeFalsy();

        await sockets.get(0).emitClient('UserLogout');
        expect(app.userService.userIsLoggedIn('user1')).toBeFalsy();
        expect(clientKnows).toBeFalsy();
        
        await login(sockets.get(0), 'user1');
        expect(clientKnows).toBeTruthy();
        expect(app.userService.userIsLoggedIn('user1')).toBeFalsy();
    });
});
