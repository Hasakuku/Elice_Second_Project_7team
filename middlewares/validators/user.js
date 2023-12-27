const { body, query } = require('express-validator');

exports.validationGetUsers = [
    query('perPage').optional().trim().isNumeric().withMessage('perPage는 숫자여야 합니다.'),
    query('page').optional().trim().isNumeric().withMessage('page는 숫자여야 합니다.'),
];

exports.validationPutUsers = [
    body('email').notEmpty().isString().withMessage('유저 이메일이 필요합니다'),
    body('name').notEmpty().isString().withMessage('바 이름이 필요합니다'),
];

exports.validationGetUsersWishList = [
    query('type').isIn(['cocktails', 'recipes']).withMessage('type은 칵테일 또는 레시피중 하나여야 합니다.'),
    query('cursorId').optional().trim().isMongoId().withMessage('cursorId는 필수입니다.'),
    query('perPage').optional().trim().isNumeric().withMessage('perPage는 숫자여야 합니다.'),
    query('page').optional().trim().isNumeric().withMessage('page는 숫자여야 합니다.'),
];