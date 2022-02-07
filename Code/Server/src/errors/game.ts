import { KnownError } from "./generic";

export class UserAlreadyInGameError extends KnownError {
    constructor() {
        super(UserAlreadyInGameError.name);
        this.name = UserAlreadyInGameError.name;
    }
}

export class UserNotInGameError extends KnownError {
    constructor() {
        super(UserNotInGameError.name);
        this.name = UserNotInGameError.name;
    }
}

export class GameAlreadyExistsError extends KnownError {
    constructor() {
        super(GameAlreadyExistsError.name);
        this.name = GameAlreadyExistsError.name;
    }
}

export class GameDoesNotExistError extends KnownError {
    constructor() {
        super(GameDoesNotExistError.name);
        this.name = GameDoesNotExistError.name;
    }
}

export class NotEnoughPlayersError extends KnownError {
    constructor() {
        super(NotEnoughPlayersError.name);
        this.name = NotEnoughPlayersError.name;
    }
}

export class BadGameModeError extends KnownError {
    constructor() {
        super(BadGameModeError.name);
        this.name = BadGameModeError.name;
    }
}


export class BadDifficultyError extends KnownError {
    constructor() {
        super(BadDifficultyError.name);
        this.name = BadDifficultyError.name;
    }
}
