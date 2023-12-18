const asyncHandler = require('express-async-handler');
const { ForbiddenError, } = require('../utils/customError');

// 글쓰기 권한 체크 미들웨어
module.exports = asyncHandler(async (req, res, next) => {
   const isWrite = req.user.isWrite;
   // 권한 유무 체크
   if (isWrite) {
      next();
   } else throw new ForbiddenError('접근 제한');
});
