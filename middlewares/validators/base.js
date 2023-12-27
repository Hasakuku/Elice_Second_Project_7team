const { body } = require('express-validator');

exports.validationPutBase = [
    body('name').notEmpty().isString().withMessage('칵테일 베이스 이름은 문자여야 합니다.'),
    body('newImageNames.*').notEmpty().isString()
    .matches(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|bmp|BMP|psd|PSD)$/).withMessage('칵테일 베이스 이미지 파일 형식이 아닙니다.'),
  ];

  exports.validationPostBase = [
    body('name').notEmpty().isString().withMessage('칵테일 베이스 이름은 문자여야 합니다.'),
    body('newImageNames.*.imageName').notEmpty().isString()
    .matches(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|bmp|BMP|psd|PSD)$/).withMessage('칵테일 베이스 이미지 파일 형식이 아닙니다.'),
  ];