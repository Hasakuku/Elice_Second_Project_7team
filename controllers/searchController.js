const asyncHandler = require('express-async-handler');
const searchService = require('../services/searchService');
const { BadRequestError } = require('../utils/customError');
const { jwtSecret } = require('../config');
const { UnauthorizedError } = require('../utils/customError');
const jwt = require('jsonwebtoken');


const searchByKeyword = asyncHandler(async (req, res) => {
   let user;
   if (req.cookies.jwtToken) {
      user = jwt.verify(req.cookies.jwtToken, jwtSecret, function (err, decoded) {
         if (err) throw new UnauthorizedError('토큰 검증 실패');
         return decoded;
      });
   }
   let { keyword, ...rest } = req.query;
   if (!keyword) throw new BadRequestError('검색창에 입력해주세요');
   const result = await searchService.searchByKeyword(user, { keyword, ...rest });
   res.status(200).json(result);
});

module.exports = { searchByKeyword, };