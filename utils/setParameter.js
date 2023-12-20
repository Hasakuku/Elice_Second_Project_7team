const { BadRequestError } = require("./customError");

// type, item, page를 처리 후 반환
module.exports = (item, page, type) => {
   const limit = item === undefined || item === null ? 10 : item;
   const skip = page ? (page - 1) * limit : 0;
   const types = (type === 'cocktail' ? ['CocktailReview']
      : type === 'recipe' ? ['DiyRecipeReview']
         : type === undefined || type === null ? ['CocktailReview', 'DiyRecipeReview']
            : (() => { throw new BadRequestError('타입 오류'); })());
   return { limit, skip, types };
};