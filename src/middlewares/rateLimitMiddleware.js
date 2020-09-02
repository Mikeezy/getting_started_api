const rateLimit = require('express-rate-limit');
const redisStore = require('rate-limit-redis');
const client = require('../utils/redis');
const { LIMIT_API_CALL } = require('../utils/errorCode');

const store = new redisStore({
  client,
  expiry: 60 * 60,
});

function authLimiterMiddleware({
  max = 5,
  message = 'Too many actions from you, please try again after an hour',
}) {
  const authLimiter = rateLimit({
    store: store,
    windowMs: 60 * 60 * 1000, // 1 hour window
    max, // start blocking after max requests
    delayMs: 0,
    message,
    handler: function rateLimiterCallback(req, res) {
      return res.status(200).json({
        success: false,
        code: LIMIT_API_CALL,
        message,
      });
    },
    skipFailedRequests: true,
  });

  return authLimiter;
}

function apiLimiterMiddleware({
  time = 15 * 60 * 1000,
  max = 5,
  message = 'Too many actions from you, please try again after 15 minutes',
}) {
  const apiLimiter = rateLimit({
    store: store,
    windowMs: time, // time window
    max, // start blocking after max requests
    delayMs: 0,
    message,
    handler: function rateLimiterCallback(req, res) {
      return res.status(200).json({
        success: false,
        code: LIMIT_API_CALL,
        message,
      });
    },
    skipFailedRequests: true,
  });

  return apiLimiter;
}

module.exports = {
  authLimiterMiddleware,
  apiLimiterMiddleware,
};
