const asyncHandler = require('express-async-handler');
const cocktailService = require('../services/cocktailService');

const customCocktail = asyncHandler(async (req, res) => {
   const { base, abv, taste, level } = req.query;
   const result = await cocktailService.customCocktail(base, abv, taste, level);
   res.status(200).json(result)
})

module.exports = { customCocktail };