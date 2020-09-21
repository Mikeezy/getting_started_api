const jwt = require('jsonwebtoken');
const { CustomError } = require('../utils/customError');
const config = require('../../config');
const {
  TOKEN_NOT_PROVIDED,
  TOKEN_EXPIRED,
  TOKEN_INVALID,
} = require('../utils/errorCode');
const Promise = require('bluebird');

const jwtVerifyAsync = Promise.promisify(jwt.verify);
const privateKey = config.get('jwtSecret');
const accessTokenCookieName = config.get('accessTokenCookieName');

module.exports = async (req, res, next) => {
  let token =
    req.body.token ||
    req.query.token ||
    req.headers['authorization'] ||
    req.cookies[accessTokenCookieName];

  if (!token) {
    next(
      new CustomError(
        'Token non fournit, veuillez vous identifier svp !',
        TOKEN_NOT_PROVIDED
      )
    );
  } else {
    token = token.replace('Bearer ', '');

    try {
      const decoded = await jwtVerifyAsync(token, privateKey);

      res.locals.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        next(
          new CustomError(
            'Token expired, please retry or authenticate yourself !',
            TOKEN_EXPIRED
          )
        );
      } else if (error.name === 'JsonWebTokenError') {
        next(
          new CustomError(
            'Invalid Token, please retry or authenticate yourself !',
            TOKEN_INVALID
          )
        );
      } else {
        next(error);
      }
    }
  }
};
