const { body, query, param } = require('express-validator');

exports.validationGetBarList = [
    query('x1')
        .optional().trim()
        .isNumeric().withMessage('x1는 실수 값이어야 합니다'),
    query('x2')
        .optional().trim()
        .isNumeric().withMessage('x2는 실수 값이어야 합니다'),
    query('y1')
        .optional().trim()
        .isNumeric().withMessage('y1는 실수 값이어야 합니다'),
    query('y2')
        .optional().trim()
        .isNumeric().withMessage('y2는 실수 값이어야 합니다'),
    query('keyword')
        .optional().trim()
        .isLength({ max: 24 }).withMessage('검색어는 24글자 제한이 있습니다.'),
    query('perPage')
        .optional().trim()
        .isInt().withMessage('perPage는 숫자여야 합니다.'),
    query('page')
        .optional().trim()
        .isInt().withMessage('page는 숫자여야 합니다.'),
];

exports.validationCreateBar = [
    body('name')
        .trim()
        .notEmpty().withMessage('바 이름이 필요합니다'),
    body('newImageNames.*.imageName')
        .notEmpty().withMessage('이미지가 필요합니다.')
        .matches(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|bmp|BMP|psd|PSD)$/).withMessage('이미지 파일 형식이 아닙니다.'),
    body('address')
        .trim()
        .notEmpty().withMessage('바 주소가 필요합니다'),
    body('tel')
        .optional().trim()
        .isMobilePhone('ko-KR').withMessage('유효하지 않은 전화번호입니다'),
    body('time')
        .trim()
        .notEmpty().withMessage('운영 시간이 필요합니다'),
    body('x')
        .optional().trim()
        .isNumeric().withMessage('x는 실수 값이어야 합니다'),
    body('y')
        .optional().trim()
        .isNumeric().withMessage('y는 실수 값이어야 합니다'),
];

exports.validationUpdateBar = [
    param('id')
        .trim()
        .isMongoId().withMessage('유효한 MongoDB ID 가 아닙니다.'),
    body('name')
        .optional().trim(),
    body('newImageNames.*.imageName')
        .optional().isString()
        .matches(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|bmp|BMP|psd|PSD)$/).withMessage('바 이미지 파일 형식이 아닙니다.'),
    body('tel')
        .optional()
        .isMobilePhone('ko-KR').withMessage('유효하지 않은 전화번호입니다'),
    body('x')
        .optional()
        .isNumeric().withMessage('x는 실수 값이어야 합니다'),
    body('y')
        .optional()
        .isNumeric().withMessage('y는 실수 값이어야 합니다'),
];