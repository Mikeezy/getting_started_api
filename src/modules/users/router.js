const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');
const cacheMiddleware = require('../../middlewares/cacheMiddleware');
const validationHandlerMiddleware = require('../../middlewares/validationHandlerMiddleware');
const asyncMiddleware = require('../../middlewares/asyncMiddleware');
const responseHandlerMiddleware = require('../../middlewares/responseHandlerMiddleware');
const validator = require('express-validator');
const validationSchema = require('./validation');
const {
  getAll,
  block,
  signupAdminPartOne,
  updatePassword,
  updateProfile,
} = require('./controller');

const router = express.Router();

// Token checking
router.use(authMiddleware);

// Path
router.get(
  '/',
  validator.checkSchema(validationSchema.getAllSchema),
  validationHandlerMiddleware,
  cacheMiddleware.get,
  asyncMiddleware(async (req, res, next) => {
    const data = {
      ...req.query,
    };

    res.locals.data = await getAll(data);

    next();
  }),
  cacheMiddleware.set,
  responseHandlerMiddleware
);

router.get(
  '/block/:id',
  validator.checkSchema(validationSchema.blockSchema),
  validationHandlerMiddleware,
  asyncMiddleware(async (req, res, next) => {
    const data = {
      ...req.params,
    };

    res.locals.data = await block(data);

    next();
  }),
  cacheMiddleware.clear,
  responseHandlerMiddleware
);

router.post(
  '/updatePassword',
  validator.checkSchema(validationSchema.updatePasswordSchema),
  validationHandlerMiddleware,
  asyncMiddleware(async (req, res, next) => {
    const data = {
      ...req.body,
      user: res.locals.user,
    };

    res.locals.data = await updatePassword(data);

    next();
  }),
  responseHandlerMiddleware
);

router.post(
  '/updateProfile',
  validator.checkSchema(validationSchema.updateProfileSchema),
  validationHandlerMiddleware,
  asyncMiddleware(async (req, res, next) => {
    const data = {
      ...req.body,
      user: res.locals.user,
    };

    res.locals.data = await updateProfile(data);

    next();
  }),
  cacheMiddleware.clear,
  responseHandlerMiddleware
);

router.post(
  '/signupAdminPartOne',
  validator.checkSchema(validationSchema.signupAdminPartOneSchema),
  validationHandlerMiddleware,
  asyncMiddleware(async (req, res, next) => {
    const data = {
      ...req.body,
    };

    res.locals.data = await signupAdminPartOne(data);

    next();
  }),
  responseHandlerMiddleware
);

module.exports = router;
