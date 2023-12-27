const { query } = require('express-validator');

exports.validationGetSearch = [
    query('type').isIn(['cocktails', 'recipes']).withMessage('type은 칵테일 또는 레시피중 하나여야 합니다.'),
    query('perPage').optional().trim().isNumeric().withMessage('perPage는 숫자여야 합니다.'),
    query('page').optional().trim().isNumeric().withMessage('page는 숫자여야 합니다.'),
];