const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const { UnauthorizedError } = require('../utils/customError');

module.exports = (req) => {
   let user;
   if (req.cookies.jwtToken) {
      user = jwt.verify(req.cookies.jwtToken, jwtSecret, function (err, decoded) {
         if (err) throw new UnauthorizedError('토큰 검증 실패');
         return decoded;
      });
   }
   return user;
};