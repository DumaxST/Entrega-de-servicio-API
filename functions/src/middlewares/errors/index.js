/**
 * Client error class for handling API errors
 */
class ClientError extends Error {
  /**
   * Constructor for ClientError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }

  /**
   * Convert error to JSON format
   * @return {object} Error object
   */
  toJSON() {
    return {
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

module.exports = {ClientError};
