const { successMessage } = require('../utils/response');

module.exports = function (req, res, next) {
  const dataToReturn = successMessage(res.locals.data);
  return res.status(200).json(dataToReturn);
};
