import { SocketInterface, SocketServerInterface } from './services/network/Socket/SocketService';

export class SocketMock implements SocketInterface {
    clientToServer: Map<string, (param: any) => Promise<void>>;
    serverToClient: Map<string, (param: any) => Promise<void>>;
    
    constructor(public id: string) {
        this.clientToServer = new Map();
        this.serverToClient = new Map();
    }

    on = (Ty: string, callback: (param: any) => Promise<void>): void => {
        if (this.clientToServer.get(Ty))
            throw new Error('Duplicate on defined: ' + Ty);
        this.clientToServer.set(Ty, callback);
    }

    emit = async (Ty: string, param?: any): Promise<void> => {
        const lambda = this.serverToClient.get(Ty);
        if (lambda)
            await lambda(param);
    }

    onServer = (Ty: string, callback: (param: any) => Promise<void>): void => {
        if (this.serverToClient.get(Ty))
            throw new Error('Duplicate on defined: ' + Ty);
        this.serverToClient.set(Ty, callback);
    }

    emitClient = async (Ty: string, param?: any): Promise<void> => {
        const lambda = this.clientToServer.get(Ty);
        if (lambda)
            await lambda(param);
    }
}

export class SocketServerMock implements SocketServerInterface<SocketMock> {
    listeners: Map<string, (param: any) => void | Promise<void>>;
    
    constructor() {
        this.listeners = new Map();
    }

    on = (Ty: string, callback: (param: any) => void): void => {
        this.listeners.set(Ty, callback);
    }

    emit = async (Ty: string, param?: any): Promise<void>  => {
        const lambda = this.listeners.get(Ty);
        if (lambda)
            await lambda(param);
    }
}
