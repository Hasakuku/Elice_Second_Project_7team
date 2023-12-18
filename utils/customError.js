class CustomError extends Error {
    constructor(status, message, name) {
        super(message);
        this.name = name;
        this.status = status;
    }
}

class NotFoundError extends CustomError {
    constructor(message) {
        super(404, message, 'NotFoundError');
    }
}

class BadRequestError extends CustomError {
    constructor(message) {
        super(400, message, 'BadRequestError');
    }
}

class UnauthorizedError extends CustomError {
    constructor(message) {
        super(401, message, 'UnauthorizedError');
    }
}

class ForbiddenError extends CustomError {
    constructor(message) {
        super(403, message, 'ForbiddenError');
    }
}

class InternalServerError extends CustomError {
    constructor(message) {
        super(500, message, 'InternalServerError');
    }
}

class ValidationError extends CustomError {
    constructor(message) {
        super(422, message, 'ValidationError');
    }
}

class DatabaseError extends CustomError {
    constructor(message) {
        super(500, message, 'DatabaseError');
    }
}

class NotModifiedError extends CustomError {
    constructor(message) {
        super(304, message, 'NotModifiedError');
    }
}

class ConflictError extends CustomError {
    constructor(message) {
        super(409, message, 'ConflictError');
    }
}

module.exports = {
    ConflictError,
    NotModifiedError,
    DatabaseError,
    ValidationError,
    InternalServerError,
    ForbiddenError,
    UnauthorizedError,
    BadRequestError,
    NotFoundError,
    CustomError
};