const { body, query, param } = require('express-validator');

exports.checkGetReviewListByKeyword = [
   query('page')
      .optional().trim()
      .isInt().withMessage('page는 숫자여야 합니다.'),
   query('perPage')
      .optional().trim()
      .isInt().withMessage('perPage는 숫자여야 합니다.'),];
exports.checkGetReviewList = [
   query('id')
      .optional().trim()
      .isMongoId().withMessage('유효한 MongoDB ID가 아닙니다.'),
   query('cursorId')
      .optional().trim()
      .isMongoId().withMessage('유효한 MongoDB ID가 아닙니다.'),
   query('page')
      .optional().trim()
      .isInt().withMessage('page는 숫자여야 합니다.'),
   query('perPage')
      .optional().trim()
      .isInt().withMessage('perPage는 숫자여야 합니다.'),
];

exports.checkGetUserReviewList = [
   query('type')
      .optional().trim()
      .isIn(['cocktails', 'recipes']).withMessage('cocktails recipes 또는 입력값이 없어야 합니다.'),
   query('cursorId')
      .optional().trim()
      .isMongoId().withMessage('유효한 MongoDB ID가 아닙니다.'),
   query('page')
      .optional().trim()
      .isInt().withMessage('page는 숫자여야 합니다.'),
   query('perPage')
      .optional().trim()
      .isInt().withMessage('perPage는 숫자여야 합니다.'),
];
exports.checkUpdateReview = [
   param('id')
      .trim()
      .isMongoId().withMessage('유효한 MongoDB ID 가 아닙니다.'),
   body('newImageNames.*.imageName')
      .optional()
      .matches(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|bmp|BMP|psd|PSD)$/).withMessage('유효한 이미지 파일 형식이 아닙니다.'),
   body('content')
      .optional()
      .notEmpty().withMessage('리뷰 내용이 필요합니다'),
   body('rating')
      .optional()
      .isInt({ min: 1, max: 5 }).withMessage('평점은 0에서 5 사이의 정수 값이어야 합니다'),
];
exports.checkCreateReview = [
   param('id')
      .trim()
      .isMongoId().withMessage('유효한 MongoDB ID 가 아닙니다.'),
   body('newImageNames.*.imageName')
      .optional()
      .matches(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|bmp|BMP|psd|PSD)$/).withMessage('유효한 이미지 파일 형식이 아닙니다.'),
   body('content')
      .notEmpty().withMessage('리뷰 내용이 필요합니다'),
   body('rating')
      .trim()
      .notEmpty().withMessage('리뷰에 평점이 있어야 합니다')
      .isInt({ min: 1, max: 5 }).withMessage('평점은 0에서 5 사이의 정수 값이어야 합니다'),
];