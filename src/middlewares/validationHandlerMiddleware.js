const validator = require('express-validator');
const { PropertyInvalidWithErrorMessage } = require('../utils/customError');

module.exports = function (req, res, next) {
  const errors = validator.validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const field = errors.array()[0];
  const error = new PropertyInvalidWithErrorMessage(field.param, field.msg);
  next(error);
};
