const { param } = require('express-validator');

exports.params = [
   param('id')
      .trim()
      .isMongoId().withMessage('유효한 MongoDB ID 가 아닙니다.')
];