import { KnownError } from "./generic";

export class UserDoesNotExistError extends KnownError {
    constructor() {
        super(UserDoesNotExistError.name);
        this.name = UserDoesNotExistError.name;
    }
}

export class UserAlreadyLoggedInError extends KnownError {
    constructor() {
        super(UserAlreadyLoggedInError.name);
        this.name = UserAlreadyLoggedInError.name;
    }
}

export class BadPasswordError extends KnownError {
    constructor() {
        super(BadPasswordError.name);
        this.name = BadPasswordError.name;
    }
}

export class UsernameExistsError extends KnownError {
    constructor() {
        super(UsernameExistsError.name);
        this.name = UsernameExistsError.name;
    }
}

export class EmailExistsError extends KnownError {
    constructor() {
        super(EmailExistsError.name);
        this.name = EmailExistsError.name;
    }
}

export class HashError extends KnownError {
    constructor() {
        super(HashError.name);
        this.name = HashError.name;
    }
}

export class UserCheatedError extends KnownError {
    constructor() {
        super(UserCheatedError.name);
        this.name = UserCheatedError.name;
    }
}
