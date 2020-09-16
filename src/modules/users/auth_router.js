const express = require('express');
const cacheMiddleware = require('../../middlewares/cacheMiddleware');
const validationHandlerMiddleware = require('../../middlewares/validationHandlerMiddleware');
const asyncMiddleware = require('../../middlewares/asyncMiddleware');
const responseHandlerMiddleware = require('../../middlewares/responseHandlerMiddleware');
const validator = require('express-validator');
const validationSchema = require('./validation');
const {
  auth,
  checkToken,
  signup,
  signupAdminPartTwo,
  signupPartTwo,
  resetPasswordPartOne,
  resetPasswordPartTwo,
} = require('./controller');
const {
  authLimiterMiddleware,
} = require('../../middlewares/rateLimitMiddleware');
const config = require('../../../config');

const router = express.Router();

router.post(
  '/signin',
  validator.checkSchema(validationSchema.auth),
  validationHandlerMiddleware,
  asyncMiddleware(async (req, res, next) => {
    const data_ = {
      ...req.body,
      expiresIn: true,
    };

    const {
      data: { password, ...data__ },
      token,
    } = await auth(data_);

    res.locals.data = { ...data__, token };
    res.cookie(config.get('accessTokenCookieName'), `Bearer ${token}`, {
      maxAge: 86400000,
    });

    next();
  }),
  responseHandlerMiddleware
);

router.post(
  '/signinAdmin',
  validator.checkSchema(validationSchema.auth),
  validationHandlerMiddleware,
  asyncMiddleware(async (req, res, next) => {
    const data = {
      ...req.body,
      expiresIn: true,
    };

    res.locals.data = await auth(data);

    next();
  }),
  responseHandlerMiddleware
);

router.post(
  '/signup',
  validator.checkSchema(validationSchema.signup),
  validationHandlerMiddleware,
  asyncMiddleware(async (req, res, next) => {
    const data = {
      ...req.body,
    };

    res.locals.data = await signup(data);

    next();
  }),
  responseHandlerMiddleware
);

router.post(
  '/signupAdminPartTwo/:token',
  validator.checkSchema(validationSchema.signupAdminPartTwoSchema),
  validationHandlerMiddleware,
  authLimiterMiddleware({
    max: config.get('limitApiCall.auth'),
    message: `You have exceeded the maximum number of attempts (${config.get(
      'limitApiCall.auth'
    )}), please retry after 1 hour !`,
  }),
  asyncMiddleware(async (req, res, next) => {
    const decoded = await checkToken({
      ...req.params,
    });
    const data = {
      ...req.body,
      ...decoded,
    };

    const { confirm_password, ...dataFiltered } = data;

    res.locals.data = await signupAdminPartTwo(dataFiltered);

    next();
  }),
  cacheMiddleware.customClear('/v1/user'),
  cacheMiddleware.clear,
  responseHandlerMiddleware
);

router.get(
  '/signupPartTwo/:token',
  validator.checkSchema(validationSchema.signupPartTwoSchema),
  validationHandlerMiddleware,
  authLimiterMiddleware({
    max: config.get('limitApiCall.auth'),
    message: `You have exceeded the maximum number of attempts (${config.get(
      'limitApiCall.auth'
    )}), please retry after 1 hour !`,
  }),
  asyncMiddleware(async (req, res, next) => {
    const data = await checkToken({
      ...req.params,
    });

    res.locals.data = await signupPartTwo(data);

    next();
  }),
  cacheMiddleware.customClear('/v1/user'),
  cacheMiddleware.clear,
  responseHandlerMiddleware
);

router.post(
  '/resetPasswordPartOne',
  validator.checkSchema(validationSchema.resetPasswordPartOneSchema),
  validationHandlerMiddleware,
  authLimiterMiddleware({
    max: config.get('limitApiCall.auth'),
    message: `You have exceeded the maximum number of attempts (${config.get(
      'limitApiCall.auth'
    )}), please retry after 1 hour !`,
  }),
  asyncMiddleware(async (req, res, next) => {
    const data = {
      ...req.body,
    };

    res.locals.data = await resetPasswordPartOne(data);

    next();
  }),
  responseHandlerMiddleware
);

router.post(
  '/resetPasswordPartTwo/:token',
  validator.checkSchema(validationSchema.resetPasswordPartTwoSchema),
  validationHandlerMiddleware,
  authLimiterMiddleware({
    max: config.get('limitApiCall.auth'),
    message: `You have exceeded the maximum number of attempts (${config.get(
      'limitApiCall.auth'
    )}), please retry after 1 hour !`,
  }),
  asyncMiddleware(async (req, res, next) => {
    const decoded = await checkToken({
      ...req.params,
    });

    const data = {
      ...req.body,
      ...decoded,
    };

    res.locals.data = await resetPasswordPartTwo(data);

    next();
  }),
  responseHandlerMiddleware
);

router.get(
  '/checkToken/:token',
  validator.checkSchema(validationSchema.checkTokenSchema),
  validationHandlerMiddleware,
  asyncMiddleware(async (req, res, next) => {
    const data = {
      ...req.params,
    };

    res.locals.data = await checkToken(data);

    next();
  }),
  responseHandlerMiddleware
);

module.exports = router;
