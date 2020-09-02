const logger = require('./logger');
const emailController = require('../email/controller');
const config = require('../../config');
const {
  ERROR,
  VALIDATION_ERROR,
  PROPERTY_INVALID,
} = require('../utils/errorCode');

class MyError extends Error {
  constructor(message) {
    super(message);
    this.isLogged = true;
    this.isOperationalError = true;
    this.name = this.constructor.name;
  }
}

class ValidationError extends MyError {
  constructor(message, isLogged = false) {
    super(message);
    this.isLogged = isLogged;
    this.code = VALIDATION_ERROR;
  }
}

class PropertyInvalidWithErrorMessage extends ValidationError {
  constructor(property, message, isLogged = false) {
    super(message, isLogged);
    this.property = property;
    this.code = PROPERTY_INVALID;
  }
}

class PropertyInvalidError extends PropertyInvalidWithErrorMessage {
  constructor(property, isLogged = false) {
    super(
      property,
      `${property} is required or invalid, please retry !`,
      isLogged
    );
  }
}

class CustomError extends MyError {
  constructor(message, code = ERROR, isLogged = false) {
    super(message);
    this.isLogged = isLogged;
    this.code = code;
  }
}

class CustomErrorWithCause extends CustomError {
  constructor(message, cause, code = ERROR, isLogged = false) {
    super(message, code, isLogged);
    this.cause = cause;
  }
}

class CustomSimpleError extends CustomError {
  constructor(isLogged = false) {
    super(
      `Operation failure, it seems like something went wrong, please retry !`,
      ERROR,
      isLogged
    );
  }
}

function isOperationalError(error) {
  return error.isOperationalError;
}

function logError(error) {
  if (typeof error.isLogged === 'undefined' || error.isLogged) {
    logger.error(
      `\nName : ${error.name || ''} \nMessage : ${
        error.message || ''
      } \nCode : ${error.code || ''} \nStack : ${error.stack || ''}`
    );
  }

  return;
}

async function sendMailToAdmin(error) {
  try {
    const content = `
              <br/>
              <p style="font-weight : bold;">Name : ${error.name || ''}</p>
              <br/>
              <p style="font-weight : bold;">Message : ${
                error.message || ''
              }</p>
              <br/>
              <p>Code : ${error.code || ''}</p>
              <br/>
              <p>Stack : ${error.stack || ''}</p>
              <br/>
          `;
    await emailController.sendMail({
      to: config.get('email.EMAIL_ADMIN'),
      subject: `Critical error occurred, please check it out: ${config.get(
        'appName'
      )}`,
      content,
    });

    return;
  } catch (e) {
    logger.error(`\nMessage : ${e.message || ''} \nStack : ${e.stack || ''}`);
  }
}

async function handleError(error) {
  const check = isOperationalError(error);

  logError(error);
  if (config.get('nodeEnv') !== 'development' && !check) {
    await sendMailToAdmin(error);
  }

  return check;
}

module.exports = {
  MyError,
  ValidationError,
  PropertyInvalidError,
  PropertyInvalidWithErrorMessage,
  CustomError,
  CustomErrorWithCause,
  CustomSimpleError,
  isOperationalError,
  logError,
  sendMailToAdmin,
  handleError,
};
