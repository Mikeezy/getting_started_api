const logger = require('../utils/logger');

module.exports = function logErrorMiddleware(error, req, res, next) {
  if (typeof error.isLogged === 'undefined' || error.isLogged) {
    logger.error(
      `\nName : ${error.name || ''} \nMessage : ${
        error.message || ''
      } \nCode : ${error.code || ''} \nStack : ${error.stack || ''}`
    );
  }

  next(error);
};
