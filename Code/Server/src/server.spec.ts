/* eslint-disable max-lines-per-function */
import { DatabaseController } from './database/DatabaseController';
import { List } from './List';
import { SocketMock, SocketServerMock } from './mocks';
import { App } from './server';
import { Salts } from './services/network/HTTP/HttpAuthenticatorService';
import { SocketService } from './services/network/Socket/SocketService';
import { Sleeper } from './services/Sleeper';

let app: App<SocketMock, SocketServerMock>;

const db: DatabaseController = new DatabaseController(false);

beforeAll(async () => {
    await db.init('server');
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
    app.socketService.init();
    await app.clearDB();
    await app.roomController.createGeneral();
    await app.wordImagePairController.init();
});

describe('Server', () => {
    it('should accept connections by adding listeners to the socket', async () => {
        const s1 = new SocketMock('1');
        expect(s1.clientToServer.size).toEqual(0);
        await app.socketService.io.emit('connection', s1);
        expect(s1.clientToServer.size).toEqual(23);
    });

    it('should let users create accounts and log in and out', async () => {
        expect(await app.userController.userExists('user1')).toBeFalsy();
        const s1 = new SocketMock('1');
        await app.socketService.io.emit('connection', s1);
        const hs = app.hashService;
        const hashpw = hs.hashString('user1pw');
        await app.httpService.httpAuthenticatorService.doAuthRegister({
            body: {
                firstName: 'user1',
                lastName: 'user1',
                username: 'user1',
                email: 'user1@gmail.com',
                hash: hashpw.toString(),
                salt: '',
                avatar: 1,
            }
        }, {
            sendStatus: (x: number) => {
                expect(x).toEqual(200);
            }
        });
        expect(await app.userController.userExists('user1')).toBeTruthy();
        expect(await app.roomController.isUserInRoom('user1', 'General')).toBeTruthy();
        let salt: Salts = undefined as unknown as Salts;
        await app.httpService.httpAuthenticatorService.doRequestSalt({
            query: { user: 'user1' }
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
        const hash = hs.hashString(salt.tempSalt + hs.hashString(salt.permSalt + hashpw));
        await s1.emitClient('UserLogin', {
            username: 'user1',
            hash,
        });
        expect(app.userService.userIsLoggedIn('user1')).toBeTruthy();
        await s1.emitClient('UserLogout');
        expect(app.userService.userIsLoggedIn('user1')).toBeFalsy();
    });

    it('should let multiple people create accounts and log in and out', async () => {
        const hs = app.hashService;
        const sockets = new List<SocketMock>();
        sockets.push(new SocketMock('1'));
        sockets.push(new SocketMock('2'));
        sockets.push(new SocketMock('3'));
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
            const hash = hs.hashString(salt.tempSalt + hs.hashString(salt.permSalt + hashpw));
            await s.emitClient('UserLogin', {
                username: `user${i}`,
                hash: hash,
            });
        }
        for (let i = 1; i <= 3; ++i) {
            await expect(app.userService.userIsLoggedIn(`user${i}`)).toBeTruthy();
            const s = sockets.get(i - 1);
            await s.emitClient('UserLogout');
            await expect(app.userService.userIsLoggedIn(`user${i}`)).toBeFalsy();
        }
    });
});
