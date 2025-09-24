class CustomError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
    static badRequest(message){
        return new CustomError(400, message);
    }
}

module.exports = CustomError;