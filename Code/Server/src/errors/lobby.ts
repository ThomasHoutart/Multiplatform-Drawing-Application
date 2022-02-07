import { KnownError } from "./generic";

export class UserAlreadyInLobbyError extends KnownError {
    constructor() {
        super(UserAlreadyInLobbyError.name);
        this.name = UserAlreadyInLobbyError.name;
    }
}

export class UserNotInLobbyError extends KnownError {
    constructor() {
        super(UserNotInLobbyError.name);
        this.name = UserNotInLobbyError.name;
    }
}

export class LobbyAlreadyExistsError extends KnownError {
    constructor() {
        super(LobbyAlreadyExistsError.name);
        this.name = LobbyAlreadyExistsError.name;
    }
}

export class LobbyDoesNotExistError extends KnownError {
    constructor() {
        super(LobbyDoesNotExistError.name);
        this.name = LobbyDoesNotExistError.name;
    }
}

export class LobbyFullError extends KnownError {
    constructor() {
        super(LobbyFullError.name);
        this.name = LobbyFullError.name;
    }
}
