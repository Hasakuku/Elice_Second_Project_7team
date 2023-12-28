const { body, query } = require('express-validator');

exports.validationGetUserList = [
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

exports.validationUpdateUser = [
    body('email')
        .optional().trim()
        .isEmail().withMessage('이메일 형식이어야 합니다'),
    body('name')
        .optional()
        .isString().withMessage('바 이름이 필요합니다'),
];

exports.validationGetWishListByType = [
    query('type')
        .isIn(['cocktails', 'recipes']).withMessage('type은 칵테일 또는 레시피중 하나여야 합니다.'),
    query('cursorId')
        .optional().trim()
        .isMongoId().withMessage('유효한 MongoDB ID가 아닙니다.'),
    query('perPage')
        .optional().trim()
        .isInt().withMessage('perPage는 숫자여야 합니다.'),
    query('page')
        .optional().trim()
        .isInt().withMessage('page는 숫자여야 합니다.'),
];

exports.validationUpdateUserCustom = [
    body('base')
        .optional().trim()
        .isString().withMessage('문자열을 입력해주세요'),
    body('taste')
        .notEmpty().withMessage('taste를 입력 해야합니다.')
        .isIn(['sweet', 'bitter', 'sour']).withMessage('맛은 sweet, bitter, sour 중 하나여야 합니다.'),
    body('level')
        .optional().trim()
        .isIn([1, 2, 3]).withMessage('level 1~3 이여야 합니다.'),
];