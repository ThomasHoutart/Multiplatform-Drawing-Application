export abstract class KnownError extends Error { }

export class NotLoggedInError extends KnownError {
    constructor() {
        super(NotLoggedInError.name);
        this.name = NotLoggedInError.name;
    }
}

export class PermissionError extends KnownError {
    constructor() {
        super(PermissionError.name);
        this.name = PermissionError.name;
    }
}

export class ContentError extends KnownError {
    constructor() {
        super(ContentError.name);
        this.name = ContentError.name;
    }
}
