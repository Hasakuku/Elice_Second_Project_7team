const { BadRequestError } = require("./customError");

// type, perPage, page를 처리 후 반환
module.exports = (perPage, page, type) => {
   const limit = perPage === undefined || perPage === null ? 10 : Number(perPage);
   const skip = page ? Number(page - 1) * limit : 0;
   const types = (type === 'cocktails' ? ['CocktailReview']
      : type === 'recipes' ? ['DiyRecipeReview']
         : type === undefined || type === null ? ['CocktailReview', 'DiyRecipeReview']
            : (() => { throw new BadRequestError('타입 오류'); })());
   return { limit, skip, types };
};