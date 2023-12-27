const { body, query } = require('express-validator');

exports.validationGetBars = [
    query('x1').optional().isNumeric().withMessage('x1는 실수 값이어야 합니다'),
    query('x2').optional().isNumeric().withMessage('x2는 실수 값이어야 합니다'),
    query('y1').optional().isNumeric().withMessage('y1는 실수 값이어야 합니다'),
    query('y2').optional().isNumeric().withMessage('y2는 실수 값이어야 합니다'),
    query('keyword').optional().trim().isString().withMessage('keyword는 문자여야 합니다.'),
    query('perPage').optional().trim().isNumeric().withMessage('perPage는 숫자여야 합니다.'),
    query('page').optional().trim().isNumeric().withMessage('page는 숫자여야 합니다.'),
];

exports.validationPostBars = [
    body('name').notEmpty().isString().withMessage('바 이름이 필요합니다'),
    body('newImageNames.*.imageName').notEmpty().isString()
    .matches(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|bmp|BMP|psd|PSD)$/).withMessage('바 이미지 파일 형식이 아닙니다.'),
    body('address').notEmpty().isString().withMessage('바 주소가 필요합니다'),
    body('tel').isString().optional().isMobilePhone('ko-KR').withMessage('유효하지 않은 전화번호입니다'),
    body('time').notEmpty().isString().withMessage('운영 시간이 필요합니다'), 
    body('x').optional().isNumeric().withMessage('x는 실수 값이어야 합니다'),
    body('y').optional().isNumeric().withMessage('y는 실수 값이어야 합니다'), 
];

exports.validationPutBars = [
    body('name').notEmpty().isString().withMessage('바 이름이 필요합니다'),
    body('newImageNames.*.imageName').notEmpty().isString()
    .matches(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|bmp|BMP|psd|PSD)$/).withMessage('바 이미지 파일 형식이 아닙니다.'),
    body('address').notEmpty().isString().withMessage('바 주소가 필요합니다'),
    body('tel').isString().optional().isMobilePhone('ko-KR').withMessage('유효하지 않은 전화번호입니다'),
    body('time').notEmpty().isString().withMessage('운영 시간이 필요합니다'), 
    body('x').optional().isNumeric().withMessage('x는 실수 값이어야 합니다'),
    body('y').optional().isNumeric().withMessage('y는 실수 값이어야 합니다'), 
  ];