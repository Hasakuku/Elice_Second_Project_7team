const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { jwtSecret } = require('../config');
const { ForbiddenError, NotFoundError } = require('../utils/customError');

// 토큰 체크
module.exports = (role) => asyncHandler(async (req, res, next) => {
   const jwtToken = req.cookies.jwtToken
   if (!jwtToken) {
      throw new NotFoundError("쿠키에 토큰 없음")
   }
   const user = jwt.verify(jwtToken, jwtSecret); // 토큰 검사
   let foundUser = await User.findOne({ _id: user.id, deletedAt: null }).select('_id isAdmin isWrite') // req.user에 유저 할당
   if (!foundUser) {
      throw new NotFoundError('유저 없음')
   }
   req.user = foundUser
   const isAdmin = req.user.isAdmin
   // 권한 유무 체크
   if (role === 'user' || (role === 'admin' && isAdmin)) {
      next();
   } else {
      throw new ForbiddenError("접근 제한")
   }
})