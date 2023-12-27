const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

module.exports = (user) => {
   const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin, isWrite: user.isWrite },
      jwtSecret,
      { expiresIn: '24h', }
   );

   return token;
};