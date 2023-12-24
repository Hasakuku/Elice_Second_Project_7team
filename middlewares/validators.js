const { body } = require('express-validator');

//* userModel
const validateUser = [
   body('kakaoId').isInt().withMessage('카카오 ID가 필요합니다'), //* 카카오아이디 number로 되어있던데 정수 인가요?
   body('email').isEmail().withMessage('유효한 이메일이 필요합니다'),
   body('nickname').isLength({ min: 1 }).withMessage('닉네임이 필요합니다'),
   body('isAdmin').isBoolean().withMessage('isAdmin은 boolean 값이어야 합니다'),
   body('isWrite').isBoolean().withMessage('isWrite는 boolean 값이어야 합니다'),
];

//* barModel
const validateBar = [
   body('name').notEmpty().withMessage('바 이름이 필요합니다'),
   body('image').notEmpty().withMessage('바 이미지가 필요합니다'),
   body('address').notEmpty().withMessage('바 주소가 필요합니다'),
   body('tel').optional().isMobilePhone('ko-KR').withMessage('유효하지 않은 전화번호입니다'), //* 전화번호 한국식으로 했습니다.
   body('time').notEmpty().withMessage('운영 시간이 필요합니다'), //* or 바 오픈 시간
   body('x').optional().isFloat().withMessage('x는 실수 값이어야 합니다'), //*좌표
   body('y').optional().isFloat().withMessage('y는 실수 값이어야 합니다'), //* =
];

//* baseModel
const validateBase = [
   body('name').notEmpty().withMessage('베이스 이름이 필요합니다'),
   body('image').notEmpty().withMessage('베이스 이미지가 필요합니다'),
];

//* cocktailModel - 필수 필드들만 유효성 검사
const validateCocktail = [
    body('name').notEmpty().withMessage('칵테일 이름이 필요합니다'),
    body('base').notEmpty().withMessage('칵테일 베이스가 필요합니다'),
    body('ingredient').notEmpty().withMessage('칵테일 재료 정보가 필요합니다'),
    body('abv').isFloat({ min: 0, max: 50 }).withMessage('칵테일 도수는 0도에서 50도까지 입니다'), //* 0도 = 무알콜 칵테일로 분류
    body('sweet').isInt({ min: 0, max: 5 }).withMessage('단맛은 0에서 5까지 입니다'), //* 당도? 단맛?
    body('bitter').isInt({ min: 0, max: 5 }).withMessage('쓴맛은 0에서 5까지 입니다'),
    body('sour').isInt({ min: 0, max: 5 }).withMessage('신맛은 0에서 5까지 입니다'),
];

 //* cocktailReviewModel
const validateCocktailReview = [
    body('user').notEmpty().withMessage('사용자 정보가 필요합니다'),
    body('cocktail').notEmpty().withMessage('칵테일 정보가 필요합니다'),
    body('content').notEmpty().withMessage('칵테일 리뷰 내용이 필요합니다'),
    body('rating').isInt({ min: 0, max: 5 }).withMessage('평점은 0에서 5 사이의 정수 값이어야 합니다'),
    //* likes 필드는 비어있을 수도 있기 때문에 검사 대상 제외함. ?: 아무도 좋아요를 안눌렀다면? 그럴수도있어서..
];

//* diyRecipeModel
const validateDiyRecipe = [
   body('user').notEmpty().withMessage('사용자 정보가 필요합니다'),
   body('name').notEmpty().withMessage('DIY 칵테일 이름이 필요합니다'),
   body('ingredient').notEmpty().withMessage('DIY 칵테일 재료 정보가 필요합니다'),
   body('abv').isFloat({ min: 0, max: 50 }).withMessage('DIY 칵테일 도수는 0도에서 50도까지 입니다'),
   body('sweet').isInt({ min: 0, max: 5 }).withMessage('단맛은 0에서 5까지 입니다'), //* 당도? 단맛?
   body('bitter').isInt({ min: 0, max: 5 }).withMessage('쓴맛은 0에서 5까지 입니다'),
   body('sour').isInt({ min: 0, max: 5 }).withMessage('신맛은 0에서 5까지 입니다'),
];

//* diyRecipeReviewModel
const validateDiyRecipeReview = [
   body('user').notEmpty().withMessage('사용자 정보가 필요합니다'),
   body('diyRecipe').notEmpty().withMessage('DIY 레시피 정보가 필요합니다'),
   body('content').notEmpty().withMessage('DIY 칵테일 리뷰 내용이 필요합니다'),
   body('rating').isInt({ min: 0, max: 5 }).withMessage('평점은 0에서 5 까지 입니다'),
];

module.exports = { 
    validateUser, 
    validateBar,
    validateBase,
    validateCocktail,
    validateCocktailReview,
    validateDiyRecipe, 
    validateDiyRecipeReview,
};
