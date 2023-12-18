const asyncHandler = require('express-async-handler');
const { ForbiddenError, } = require('../utils/customError');

// 관리자 체크 미들웨어
module.exports = asyncHandler(async (req, res, next) => {
   const isAdmin = req.user.isAdmin;
   // 권한 유무 체크
   if (isAdmin) {
      next();
   } else throw new ForbiddenError('접근 제한');
});
