const { body, query, param } = require('express-validator');

exports.validationUpdateBase = [
  param('id')
    .trim()
    .isMongoId().withMessage('유효한 MongoDB ID 가 아닙니다.'),
  body('name')
    .optional()
    .isString().withMessage('칵테일 베이스 이름은 문자여야 합니다.'),
  body('newImageNames.*.imageName')
    .optional()
    .matches(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|bmp|BMP|psd|PSD)$/).withMessage('칵테일 베이스 이미지 파일 형식이 아닙니다.'),
];

exports.validationCreateBase = [
  body('name').notEmpty().isString().withMessage('칵테일 베이스 이름은 문자여야 합니다.'),
  body('newImageNames.*.imageName').notEmpty().isString()
    .matches(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|bmp|BMP|psd|PSD)$/).withMessage('칵테일 베이스 이미지 파일 형식이 아닙니다.'),
];

exports.validationGetBaseList = [
  query('perPage')
    .optional().trim()
    .isInt().withMessage('perPage는 숫자여야 합니다.'),
  query('page')
    .optional().trim()
    .isInt().withMessage('page는 숫자여야 합니다.'),
];