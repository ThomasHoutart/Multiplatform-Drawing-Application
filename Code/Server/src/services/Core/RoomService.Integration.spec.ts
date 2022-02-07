/* eslint-disable max-lines-per-function */

import { SocketMock, SocketServerMock } from '../../mocks'
import { App } from '../../server'
import { SocketService } from '../network/Socket/SocketService'
import { Salts } from '../network/HTTP/HttpAuthenticatorService';
import { List } from '../../List';
import { Sleeper } from '../Sleeper';
import { DatabaseController } from '../../database/DatabaseController';

let app: App<SocketMock, SocketServerMock>;
let sockets: List<SocketMock>;

const db: DatabaseController = new DatabaseController(false);

beforeAll(async () => {
    await db.init('RoomService');
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
    const serverMock = new SocketServerMock();
    app.socketService = new SocketService<SocketMock, SocketServerMock>(app.userService, serverMock);
    await app.socketService.init();
    await app.clearDB();
    await app.roomController.createGeneral();
    await app.wordImagePairController.init();
    const hs = app.hashService;
    sockets = new List<SocketMock>([new SocketMock('1'), new SocketMock('2'), new SocketMock('3')]);
    for (let i = 1; i <= 3; ++i) {
        expect(await app.userController.userExists(`user${i}`)).toBeFalsy();
        const s = sockets.get(i - 1);
        await app.socketService.io.emit('connection', s);
        const hashpw = hs.hashString(`user${i}pw`);
        await app.httpService.httpAuthenticatorService.doAuthRegister({
            body: {
                firstName: `user${i}`,
                lastName: `user${i}`,
                username: `user${i}`,
                email: `user${i}@gmail.com`,
                hash: hashpw.toString(),
                salt: '',
                avatar: i,
            }
        }, {
            sendStatus: (x: number) => {
                expect(x).toEqual(200);
            }
        });
        expect(await app.userController.userExists(`user${i}`)).toBeTruthy();
        expect(await app.roomController.isUserInRoom(`user${i}`, 'General')).toBeTruthy();
        let salt: Salts = undefined as unknown as Salts;
        await app.httpService.httpAuthenticatorService.doRequestSalt({
            query: { user: `user${i}` }
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
            username: `user${i}`,
            hash: hash,
        });
    }
});

describe('Roomservice Integration', () => {
    it('should let users login so the other tests work', () => {
        expect(app.userService.userIsLoggedIn('user1')).toBeTruthy();
        expect(app.userService.userIsLoggedIn('user2')).toBeTruthy();
        expect(app.userService.userIsLoggedIn('user3')).toBeTruthy();
    });

    it('should let users send messages', async () => {
        const roomName = 'Hello this is my room';
        const msg1 = {
            content: 'Hello',
            roomName,
        };
        const msg2 = {
            content: 'FROM THE OTHER SIIIIIIDE',
            roomName,
        };
        let user1Receivedmsg1 = false;
        let user1Receivedmsg2 = false;
        let user2Receivedmsg1 = false;
        let user2Receivedmsg2 = false;

        sockets.get(1).onServer('CreateRoom', async () => {
            await sockets.get(1).emitClient('JoinRoom', {
                roomName,
            });
        });
        sockets.get(0).onServer('ChatMessage', async (msg) => {
            if (msg.author == 'user1')
                user1Receivedmsg1 = true;
            if (msg.author == 'user2')
                user1Receivedmsg2 = true;
        });
        sockets.get(1).onServer('ChatMessage', async (msg) => {
            if (msg.author == 'user1')
                user2Receivedmsg1 = true;
            if (msg.author == 'user2')
                user2Receivedmsg2 = true;
        });
        await sockets.get(0).emitClient('CreateRoom', {
            roomName,
        });
        await sockets.get(0).emitClient('ChatMessage', msg1);
        await sockets.get(1).emitClient('ChatMessage', msg2);
        expect(user1Receivedmsg1).toBeTruthy();
        expect(user1Receivedmsg2).toBeTruthy();
        expect(user2Receivedmsg1).toBeTruthy();
        expect(user2Receivedmsg2).toBeTruthy();
        expect(app.roomService.roomsByUser.get('user2')?.has(roomName)).toBeTruthy();
        await sockets.get(1).emitClient('LeaveRoom', {
            roomName,
        });
        expect(app.roomService.roomsByUser.get('user2')?.has(roomName)).toBeFalsy();
        expect(app.roomService.usersByRoomName.get(roomName)).toBeDefined();
        await sockets.get(0).emitClient('DeleteRoom', {
            roomName,
        });
        expect(app.roomService.usersByRoomName.get(roomName)).toBeUndefined();
    });
});
