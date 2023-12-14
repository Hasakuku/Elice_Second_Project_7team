const User = require('../models/userModel');
const axios = require('axios');
const setJwt = require('../utils/jwtToken')
const { BadRequestError, UnauthorizedError } = require('../utils/customError')
const userService = {
   async updateUser(user, email, nickname) {
      const id = user._id
      const updatedUser = await User.findByIdAndUpdate(
         id,
         { email, nickname },
         { new: true, runValidators: true }
      ).lean();
   },
   async withdrawal(user) {
      const id = user._id
      const withdrawalUser = await User.findByIdAndUpdate(
         id,
         { deletedAt: new Date() },
         { new: true, runValidators: true }
      ).lean();
   }
}

module.exports = userService