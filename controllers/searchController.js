const asyncHandler = require('express-async-handler');
const searchService = require('../services/searchService');
const { BadRequestError } = require('../utils/customError');
const verifyUserToken = require('../utils/verifyUserToken');

//* 검색
const searchByKeyword = asyncHandler(async (req, res) => {
   const user = verifyUserToken(req);
   const { keyword, cursorId, sort, cursorValue, page, perPage, type } = req.query;
   if (!keyword) throw new BadRequestError('검색창에 입력해주세요');
   const result = await searchService.searchByKeyword(user, { keyword, cursorId, sort, cursorValue, page, perPage, type });
   res.status(200).json(result);
});
//* 검색(관리자)
const searchForAdmin = asyncHandler(async (req, res) => {
   const { keyword, perPage, page, type } = req.query;
   const result = await searchService.searchForAdmin({ keyword, perPage, page, type });
   res.status(200).json(result);
});
//* 자동 완성 목록
const keywordAutoCompletion = asyncHandler(async (req, res) => {
   const { keyword, perPage, page } = req.query;
   const result = await searchService.keywordAutoCompletion({ keyword, perPage, page });
   res.status(200).json(result);
});

module.exports = { searchByKeyword, searchForAdmin, keywordAutoCompletion };