const jwt = require('jsonwebtoken');
const { customError } = require('../utils/customError');
const config = require('../../config');
const {
  TOKEN_NOT_PROVIDED,
  TOKEN_EXPIRED,
  TOKEN_INVALID,
} = require('../utils/errorCode');

const privateKey = config.get('jwtSecret');

module.exports = function (req, res, next) {
  let token = req.body.token || req.query.token || req.headers['authorization'];

  if (!token) {
    let error = new customError(
      'Token not provide, please authenticate yourself !',
      TOKEN_NOT_PROVIDED
    );
    next(error);
  } else {
    token = token.replace('Bearer ', '');

    jwt.verify(token, privateKey, function (error, decoded) {
      if (error) {
        if (error.name === 'TokenExpiredError') {
          let error = new customError(
            'Token expired, please retry or authenticate yourself !',
            TOKEN_EXPIRED
          );
          next(error);
        } else if (error.name === 'JsonWebTokenError') {
          let error = new customError(
            'Invalid Token, please retry or authenticate yourself !',
            TOKEN_INVALID
          );
          next(error);
        } else {
          next(error);
        }
      }

      res.locals.user = decoded;
      req.user = decoded;

      next();
    });
  }
};
