const { NOT_FOUND } = require('../utils/errorCode');

module.exports = function (req, res, next) {
  return res.status(200).json({
    success: false,
    code: NOT_FOUND,
    message: 'Not found, please retry !',
  });
};
