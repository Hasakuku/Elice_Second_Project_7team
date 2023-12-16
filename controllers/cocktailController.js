const asyncHandler = require('express-async-handler');
const cocktailService = require('../services/cocktailService');

const customCocktail = asyncHandler(async (req, res) => {
   let { base, abv, taste, level } = req.query;
   abv = Number(abv);
   level = Number(level);
   const result = await cocktailService.customCocktail(base, abv, taste, level);
   res.status(200).json(result);
})

const getCocktailList = asyncHandler(async (req, res) => {
   let { base, sort, abv, sweet, bitter, sour, item, page } = req.query;
   abv = Number(abv);
   sweet = Number(sweet);
   bitter = Number(bitter);
   sour = Number(sour);
   item = Number(item);
   page = Number(page);
   const result = await cocktailService.getCocktailList(base, sort, abv, sweet, bitter, sour, item, page);
   res.status(200).json(result);
})

module.exports = { customCocktail, getCocktailList };