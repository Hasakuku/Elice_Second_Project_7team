const User = require('../models/userModel');
const { BadRequestError, ConflictError, NotFoundError, InternalServerError } = require('../utils/customError')
const mongoose = require('mongoose');
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
   // 사용자 탈퇴
   async withdrawal(user) {
      const id = user._id
      const withdrawalUser = await User.findByOneAndUpdate(
         { _id: id, deletedAt: null },
         { deletedAt: new Date() },
         { new: true, runValidators: true }
      ).lean();
      if (!withdrawalUser) throw new NotFoundError("사용자 정보 없음");
   },
   //사용자 찜 목록 조회
   async getWishListByType(user, type, item, page) {
      //페이지당 아이템 수
      const limit = item ? item : 10;
      const skip = page ? (page - 1) * limit : 0;
      const id = user._id;
      // const id = new mongoose.Types.ObjectId(user._id);
      if (type !== 'cocktail' && type !== 'diyRecipe') throw new BadRequestError('잘못된 요청입니다.');
      let userWishList = await User.findById(id).populate({
         path: `wish.${type}`,
         populate: {
            path: 'review',
            select: 'rating -_id'
         }
      }).skip(skip).limit(limit).lean();
      if (!userWishList) throw new NotFoundError('사용자 정보 없음');
      if (userWishList.wish[type].length === 0) throw new NotFoundError('해당 타입의 찜목록 없음');
      // 각 아이템에 대한 평균 평점과 리뷰 수 계산
      for (let item of userWishList.wish[type]) {
         let avgRating = item.review.reduce((acc, review) => acc + review.rating, 0) / item.review.length;
         item.avgRating = avgRating;
         item.reviewCount = item.review.length;
      }
      const result = userWishList.wish[type].map(item => {
         return {
            _id: item._id,
            name: item.name,
            image: item.image,
            avgRating: item.avgRating,
            reviewCount: item.reviewCount,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
         }
      });
      return result;
   },

   // 사용자 찜 목록의 아이템 삭제
   async deleteWish(user, id) {
      const userId = user._id; 
      // let userId = new mongoose.Types.ObjectId(user._id);
      // 사용자 정보 확인
      const foundUser = await User.findById(userId).lean();
      if (!foundUser) {
         throw new NotFoundError('사용자 정보 없음');
      }
      if (!foundUser.wish.cocktail.includes(id) && !foundUser.wish.diyRecipe.includes(id)) {
         throw new NotFoundError('찜 목록에 아이템이 없음');
      }
      // 아이템 삭제
      const result = await User.updateOne(
         { _id: userId },
         { $pull: { 'wish.cocktail': id, 'wish.diyRecipe': id } },
         { runValidators: true }
      );
         console.log(result.modifiedCount)
      // 삭제 성공 여부 확인
      if (result.modifiedCount == 0) {
         throw new InternalServerError('아이템 삭제 실패');
      }
   }

};

module.exports = userService;