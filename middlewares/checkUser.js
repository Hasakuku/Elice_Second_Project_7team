const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const { jwtSecret } = require('../config');
const { NotFoundError, UnauthorizedError } = require('../utils/customError');

// 사용자 인증 체크 미들웨어
module.exports = asyncHandler(async (req, res, next) => {
   const jwtToken = req.cookies.jwtToken;
   if (!jwtToken) {
      throw new UnauthorizedError("쿠키에 토큰 없음");
   }
   // 토큰 검사
   const user = jwt.verify(jwtToken, jwtSecret, function (err, decoded) {
      if (err) throw new UnauthorizedError('토큰 검증 실패');
      return decoded;
   });
   // 토큰에 유저정보 할당
   const getUserTokenPayLoad = await userService.getUserTokenPayLoad(user.id);
   // req.body.payload 유저 정보 할당
   req.user = getUserTokenPayLoad;
   next();
});