const { query } = require('express-validator');

exports.validationSearchByKeyword = [
    query('keyword')
        .optional()
        .isLength({ max: 24 }).withMessage('검색어는 24글자 제한이 있습니다.'),
    query('type')
        .optional()
        .isIn(['cocktails', 'recipes']).withMessage('type은 칵테일 또는 레시피중 하나여야 합니다.'),
    query('sort')
        .optional().trim()
        .isIn(['rating', 'review']).withMessage('rating이나 review 또는 입력값이 없어야 합니다.'),
    query('page')
        .optional().trim()
        .isInt().withMessage('page는 숫자여야 합니다.'),
    query('perPage')
        .optional().trim()
        .isInt().withMessage('perPage는 숫자여야 합니다.'),
    query('cursorId')
        .optional().trim()
        .isMongoId().withMessage('유효한 MongoDB ID가 아닙니다.'),
    query('cursorValue')
        .optional().trim()
        .isFloat().withMessage('cursorValue는 숫자여야 합니다.'),
];

exports.validationSearchForAdmin = [
    query('keyword')
        .optional()
        .isLength({ max: 24 }).withMessage('검색어는 24글자 제한이 있습니다.'),
    query('type')
        .notEmpty()
        .isIn(['cocktails', 'recipes']).withMessage('type은 칵테일 또는 레시피중 하나여야 합니다.'),
    query('perPage')
        .optional().trim()
        .isInt().withMessage('perPage는 숫자여야 합니다.'),
    query('page').optional().trim()
        .isInt().withMessage('page는 숫자여야 합니다.'),
];

exports.validationKeywordAutoCompletion = [
    query('keyword')
        .optional()
        .isLength({ max: 24 }).withMessage('검색어는 24글자 제한이 있습니다.'),
    query('perPage')
        .optional().trim()
        .isInt().withMessage('perPage는 숫자여야 합니다.'),
    query('page').optional().trim()
        .isInt().withMessage('page는 숫자여야 합니다.'),
];