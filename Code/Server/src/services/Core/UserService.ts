import { UserDoesNotExistError } from "../../errors/user";
import { LoginEvent } from "../../events/connectionEvents";
import { List } from "../../List";
import { SocketInterface } from "../network/Socket/SocketService";

export class UserService<Socket extends SocketInterface> {
    private users: List<string>;
    private usernameBySocket: Map<Socket, string>;
    private socketByUsername: Map<string, Socket>;
    private emailBySocket: Map<Socket, string>;
    private socketByEmail: Map<string, Socket>;
    private socketByHash: Map<string, Socket>
    private avatarByUsername: Map<string, number>;

    constructor() {
        this.users = new List();
        this.usernameBySocket = new Map();
        this.socketByUsername = new Map();
        this.emailBySocket = new Map();
        this.socketByEmail = new Map();
        this.socketByHash = new Map();
        this.avatarByUsername = new Map();
    }

    public init(): void { return }

    public getAllUsers(): List<string> {
        return this.users;
    }

    public userIsLoggedIn(user: string): boolean {
        return this.socketByUsername.has(user);
    }

    public getSocketByUsername(username: string): Socket {
        const socket = this.socketByUsername.get(username);
        if (!socket)
            throw new UserDoesNotExistError();
        return socket;
    }

    public getUserBySocket(socket: Socket): string {
        const user = this.usernameBySocket.get(socket);
        if (!user)
            throw new UserDoesNotExistError();
        return user;
    }

    public getUserAndAvatarBySocket(socket: Socket): {username: string, avatar: number} {
        const username = this.usernameBySocket.get(socket);
        if (!username)
            throw new UserDoesNotExistError();
        const avatar = this.avatarByUsername.get(username);
        if (avatar == undefined)
            throw new UserDoesNotExistError();
        return {username, avatar};
    }

    public getAvatarByUsername(username: string): number {
        if (username.startsWith('bot_'))
            return (username.length - 4) % 12;
        const avatar = this.avatarByUsername.get(username);
        if (avatar == undefined)
            throw new UserDoesNotExistError();
        return avatar;
    }

    public getUsernameBySocketHash(socketHash: string): string {
        const socket = this.socketByHash.get(socketHash);
        if (!socket)
            throw new UserDoesNotExistError();
        const username = this.usernameBySocket.get(socket);
        if (!username)
            throw new UserDoesNotExistError();
        return username;
    }

    public getEmailBySocketHash(socketHash: string): string {
        const socket = this.socketByHash.get(socketHash);
        if (!socket)
            throw new UserDoesNotExistError();
        const email = this.emailBySocket.get(socket);
        if (!email)
            throw new UserDoesNotExistError();
        return email;
    }

    public login(ev: LoginEvent<Socket>): void {
        this.users.push(ev.username);
        this.usernameBySocket.set(ev.socket, ev.username);
        this.socketByUsername.set(ev.username, ev.socket);
        this.emailBySocket.set(ev.socket, ev.email);
        this.socketByEmail.set(ev.email, ev.socket);
        this.socketByHash.set(ev.hashSocketId, ev.socket);
        this.avatarByUsername.set(ev.username, ev.avatar);
    }

    public logout(user: string): void {
        if (!this.userIsLoggedIn(user))
            throw new UserDoesNotExistError();
        const socket = this.getSocketByUsername(user);
        this.users.remove(user);
        this.usernameBySocket.delete(socket);
        this.socketByUsername.delete(user);
    }
}
