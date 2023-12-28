const { body, query, param } = require('express-validator');

exports.checkGetCocktailList = [
   query('base')
      .optional().trim()
      .isString().withMessage('문자열을 입력해주세요'),
   query('sort')
      .optional().trim()
      .isIn(['rating', 'review']).withMessage('rating이나 review 또는 입력값이 없어야 합니다.'),
   query('abv')
      .optional().trim()
      .isInt({ min: 1, max: 5 }).withMessage('abv는 1~5 사이의 숫자여야 합니다.'),
   query('sweet')
      .optional().trim()
      .isInt({ min: 1, max: 5 }).withMessage('sweet는 1~5 사이의 숫자여야 합니다.'),
   query('bitter')
      .optional().trim()
      .isInt({ min: 1, max: 5 }).withMessage('bitter는 1~5 사이의 숫자여야 합니다.'),
   query('sour')
      .optional().trim()
      .isInt({ min: 1, max: 5 }).withMessage('sour는 1~5 사이의 숫자여야 합니다.'),
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

exports.checkCreateCocktail = [
   body('name')
      .notEmpty().withMessage('필수로 입력해야 합니다.'),
   body('base')
      .notEmpty().withMessage('필수로 입력해야 합니다.')
      .isMongoId().withMessage('유효한 MongoDB ID가 아닙니다.')
      .trim(),
   body('newImageNames.*.imageName')
      .optional()
      .matches(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|bmp|BMP|psd|PSD)$/).withMessage('유효한 이미지 파일 형식이 아닙니다.'),
   body('recipeImageNames.*.imageName')
      .optional()
      .matches(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|bmp|BMP|psd|PSD)$/).withMessage('유효한 이미지 파일 형식이 아닙니다.'),
   body('ingredient')
      .notEmpty().withMessage('칵테일 재료 정보가 필요합니다'),
   body('abv')
      .notEmpty().withMessage('필수로 입력해야 합니다.')
      .isInt({ min: 1, max: 5 }).withMessage('칵테일 도수는 1에서 5까지 입니다'),
   body('sweet')
      .notEmpty().withMessage('필수로 입력해야 합니다.')
      .isInt({ min: 1, max: 5 }).withMessage('단맛은 1에서 5까지 입니다'),
   body('bitter')
      .notEmpty().withMessage('필수로 입력해야 합니다.')
      .isInt({ min: 1, max: 5 }).withMessage('쓴맛은 1에서 5까지 입니다'),
   body('sour')
      .notEmpty().withMessage('필수로 입력해야 합니다.')
      .isInt({ min: 1, max: 5 }).withMessage('신맛은 1에서 5까지 입니다'),
   body('avgRating')
      .optional()
      .isEmpty().withMessage('avgRating는 입력되지 않아야 합니다.'),
   body('reviewCount')
      .optional()
      .isEmpty().withMessage('reviewCount는 입력되지 않아야 합니다.'),
];

exports.checkUpdateCocktail = [
   param('id')
      .trim()
      .isMongoId().withMessage('유효한 MongoDB ID 가 아닙니다.'),
   body('name')
      .optional(),
   body('base')
      .optional()
      .isMongoId().withMessage('유효한 MongoDB ID가 아닙니다.')
      .trim(),
   body('newImageNames.*')
      .optional()
      .matches(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|bmp|BMP|psd|PSD)$/).withMessage('유효한 이미지 파일 형식이 아닙니다.'),
   body('recipeImageNames.*')
      .optional()
      .matches(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|bmp|BMP|psd|PSD)$/).withMessage('유효한 이미지 파일 형식이 아닙니다.'),
   body('abv')
      .optional()
      .isInt({ min: 1, max: 5 }).withMessage('칵테일 도수는 1에서 5까지 입니다'),
   body('sweet')
      .optional()
      .isInt({ min: 1, max: 5 }).withMessage('단맛은 1에서 5까지 입니다'),
   body('bitter')
      .optional()
      .isInt({ min: 1, max: 5 }).withMessage('쓴맛은 1에서 5까지 입니다'),
   body('sour')
      .optional()
      .isInt({ min: 1, max: 5 }).withMessage('신맛은 1에서 5까지 입니다'),
];