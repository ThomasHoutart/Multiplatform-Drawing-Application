import { KnownError } from "./generic";

export class UserAlreadyInRoomError extends KnownError {
    constructor() {
        super(UserAlreadyInRoomError.name);
        this.name = UserAlreadyInRoomError.name;
    }
}

export class UserNotInRoomError extends KnownError {
    constructor() {
        super(UserNotInRoomError.name);
        this.name = UserNotInRoomError.name;
    }
}

export class RoomAlreadyExistsError extends KnownError {
    constructor() {
        super(RoomAlreadyExistsError.name);
        this.name = RoomAlreadyExistsError.name;
    }
}

export class RoomDoesNotExistError extends KnownError {
    constructor() {
        super(RoomDoesNotExistError.name);
        this.name = RoomDoesNotExistError.name;
    }
}

export class TooManyRoomsError extends KnownError {
    constructor() {
        super(TooManyRoomsError.name);
        this.name = TooManyRoomsError.name;
    }
}
