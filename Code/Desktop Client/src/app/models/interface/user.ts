export type User = {
    username: string
};

export type LoginCredential = User & {
    hash: string,
};

export type CredentialCreation = {
    username?: string,
    firstName?: string,
    lastName?: string,
    email?: string,
    hash?: string,
    avatar?: number,
};

export interface Status {
    status: number,
    isSpectator: boolean,
    isHost: boolean,
}

export const OFFLINE = 0;
export const ONLINE = 1;
export const IN_LOBBY = 2;
export const IN_GAME = 3;
