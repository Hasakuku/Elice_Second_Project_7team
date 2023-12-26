const asyncHandler = require('express-async-handler');
const searchService = require('../services/searchService');
const { BadRequestError } = require('../utils/customError');
const verifyUserToken = require('../utils/verifyUserToken');


const searchByKeyword = asyncHandler(async (req, res) => {
   const user = verifyUserToken(req);
   let { keyword, ...rest } = req.query;
   if (!keyword) throw new BadRequestError('검색창에 입력해주세요');
   const result = await searchService.searchByKeyword(user, { keyword, ...rest });
   res.status(200).json(result);
});
const searchForAdmin = asyncHandler(async (req, res) => {
   const { keyword, perPage, page, type } = req.query;
   const result = await searchService.searchForAdmin({ keyword, perPage, page, type });
   res.status(200).json(result);
});

module.exports = { searchByKeyword, searchForAdmin };