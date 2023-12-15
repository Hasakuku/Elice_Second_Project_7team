const asyncHandler = require('express-async-handler');
const searchService = require('../services/searchService');


const searchByKeyword = asyncHandler(async (req, res) => {
   const { keyword, type, sort, item, page } = req.query;
   const result = await searchService.searchByKeyword(keyword, type, sort, item, page);
   res.json(result)
});

module.exports = { searchByKeyword };