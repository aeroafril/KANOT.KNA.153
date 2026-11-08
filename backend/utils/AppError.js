class AppError extends Error{constructor(massage, statusCode = 500, details = null){
    super(massage);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
}}

module.exports = AppError;