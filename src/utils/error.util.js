class ClientError extends Error {
    constructor(message, status = 400) {
        super(message)
        this.status = status

    }
}

class FileError extends Error {
    constructor(message, status = 400) {
        super(message)
        this.status = status
    }
}

class SyntaxError extends Error {
    constructor(message, status = 400) {
        super(message)
        this.status = status
    }
}

module.exports = { ClientError, FileError, SyntaxError }