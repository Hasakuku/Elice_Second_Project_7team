const User = require('../models/userModel');
const { BadRequestError, ConflictError, NotFoundError, InternalServerError } = require('../utils/customError');
const mongoose = require('mongoose');
const userService = {
   //* JWT 토큰에 할당될 사용자 정보
   async getUserTokenPayload(userId) {
      const user = await User.findOne({ _id: userId, deletedAt: null }).select('_id isAdmin isWrite').lean();
      if(!user) throw new NotFoundError('유저 정보 없음');
      return user;
   },
   //* 사용자 정보 조회
   async getUser(payload) {
      const userId = payload._id;
      const user = await User.findOne({ _id: userId, deletedAt: null }).select('-deletedAt wish').lean();
      if (!user) throw new NotFoundError("사용자 정보 없음");
      return user;
   },
   //* 사용자 정보 수정
   async updateUser(payload, email, nickname) {
      const userId = payload._id;
      const updatedUser = await User.findOneAndUpdate(
         { _id: userId, deletedAt: null },
         { email, nickname },
         { new: true, runValidators: true }
      ).lean();
      if (!updatedUser) throw new NotFoundError("사용자 정보 없음");
   },
   //* 사용자 탈퇴
   async withdrawal(payload) {
      const userId = payload._id;
      const withdrawalUser = await User.findByOneAndUpdate(
         { _id: userId, deletedAt: null },
         { deletedAt: new Date() },
         { new: true, runValidators: true }
      ).lean();
      if (!withdrawalUser) throw new NotFoundError("사용자 정보 없음");
   },
   //*사용자 찜 목록 조회
   async getWishListByType(payload, type, item, page) {
      type = `${type}s`;
      //페이지당 아이템 수
      const limit = item === undefined || item === null ? 10 : item;
      const skip = page ? (page - 1) * limit : 0;
      // const userId = payload._id;
      const userId = new mongoose.Types.ObjectId(payload._id);

      if (type !== 'cocktails' && type !== 'diyRecipes') throw new BadRequestError('잘못된 요청입니다.');
      let userWishList = await User.findById(userId).populate({
         path: `wishes.${type}`,
         populate: {
            path: 'reviews',
            select: 'rating -_id'
         }
      }).skip(skip).limit(limit).lean();
      if (!userWishList) throw new NotFoundError('사용자 정보 없음');
      if (userWishList.wishes[type].length === 0) throw new NotFoundError('해당 타입의 찜목록 없음');
      // 각 아이템에 대한 평균 평점과 리뷰 수 계산
      for (let item of userWishList.wishes[type]) {
         let avgRating = item.reviews.reduce((acc, reviews) => acc + reviews.rating, 0) / item.reviews.length;
         item.avgRating = avgRating;
         item.reviewCount = item.reviews.length;
      }
      const result = userWishList.wishes[type].map(item => {
         return {
            _id: item._id,
            name: item.name,
            image: item.image,
            avgRating: item.avgRating,
            reviewCount: item.reviewCount,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
         };
      });
      return result;
   },

   //* 사용자 찜 목록의 아이템 삭제
   async deleteWish(payload, id) {
      const userId = payload._id;
      // let userId = new mongoose.Types.ObjectId(payload._id);
      // 사용자 정보 확인
      const user = await User.findById(userId).lean();
      if (!user) {
         throw new NotFoundError('사용자 정보 없음');
      }
      if (!user.wishes.cocktail.includes(id) && !user.wishes.diyRecipe.includes(id)) {
         throw new NotFoundError('찜 목록에 아이템이 없음');
      }
      // 아이템 삭제
      const result = await User.updateOne(
         { _id: userId },
         { $pull: { 'wishes.cocktail': id, 'wishes.diyRecipe': id } },
         { runValidators: true }
      );
      // 삭제 성공 여부 확인
      if (result.modifiedCount == 0) {
         throw new InternalServerError('아이템 삭제 실패');
      }
   },
};

module.exports = userService;