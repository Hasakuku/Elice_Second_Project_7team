const asyncHandler = require('express-async-handler');
const searchService = require('../services/searchService');
const { BadRequestError } = require('../utils/customError');


const searchByKeyword = asyncHandler(async (req, res) => {
   let { keyword, type, sort, item, page } = req.query;
   if (!keyword) throw new BadRequestError('검색창에 입력해주세요');
   const result = await searchService.searchByKeyword(keyword, type, sort, item, page);
   res.status(200).json(result);
});
const countByKeyword = asyncHandler(async (req, res) => {
   const { keyword } = req.query;
   if (!keyword) throw new BadRequestError('검색창에 입력해주세요');
   const result = await searchService.countByKeyword(keyword);
   res.status(200).json(result);
});

module.exports = { searchByKeyword, countByKeyword };