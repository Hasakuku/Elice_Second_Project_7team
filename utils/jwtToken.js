const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config')

module.exports = (user) => {
   const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      jwtSecret,
      { expiresIn: '1h', }
   );

   return token;
};