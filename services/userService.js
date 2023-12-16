const User = require('../models/userModel');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../utils/customError')
const userService = {
   // 사용자 정보 조회
   async getUser(user) {
      const id = user._id;
      const getUser = await User.findOne({ _id: id, deletedAt: null }).select('-deletedAt wish').lean();
      if (!getUser) throw new NotFoundError("사용자 정보 없음");
      return getUser;
   },
   // 사용자 정보 수정
   async updateUser(user, email, nickname) {
      const id = user._id
      const updatedUser = await User.findOneAndUpdate(
         { _id: id, deletedAt: null },
         { email, nickname },
         { new: true, runValidators: true }
      ).lean();
      if (!updatedUser) throw new NotFoundError("사용자 정보 없음");
   },
   // 회원 탈퇴
   async withdrawal(user) {
      const id = user._id
      const withdrawalUser = await User.findByOneAndUpdate(
         { _id: id, deletedAt: null },
         { deletedAt: new Date() },
         { new: true, runValidators: true }
      ).lean();
      if (!withdrawalUser) throw new NotFoundError("사용자 정보 없음");
   },
};

module.exports = userService;