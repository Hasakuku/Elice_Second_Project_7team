const { User, CocktailReview, DiyRecipeReview, DiyRecipe } = require('../models');
const { BadRequestError, ConflictError, NotFoundError, InternalServerError, } = require('../utils/customError');
const mongoose = require('mongoose');
const userService = {
   //* JWT 토큰에 할당될 사용자 정보
   async getUserTokenPayload(userId) {
      const user = await User.findOne({ _id: userId, deletedAt: null }).select('_id isAdmin isWrite').lean();
      if (!user) throw new NotFoundError('유저 정보 없음');
      return user;
   },
   //* 사용자 정보 조회
   async getUser(payload) {
      const userId = payload._id;
      const user = await User.findOne({ _id: userId, deletedAt: null }).select('_id email nickname createdAt updatedAt').lean();
      if (!user) throw new NotFoundError("사용자 정보 없음");
      return user;
   },
   //* 사용자 정보 수정
   async updateUser(payload, email, nickname) {
      const userId = payload._id;
      const user = await User.findOne({ _id: userId, deletedAt: null }).lean();
      if (!user) throw new NotFoundError("사용자 정보 없음");

      const updatedUser = await User.updateOne(
         { _id: userId },
         { email, nickname },
         { runValidators: true }
      );
      if (updatedUser.nModified === 0) throw new ConflictError("업데이트 실패");
   },
   //* 사용자 탈퇴
   async withdrawal(payload) {
      const userId = payload._id;
      const user = await User.findOne({ _id: userId, deletedAt: null }).lean();
      if (!user) throw new NotFoundError("사용자 정보 없음");

      const withdrawalUser = await User.updateOne(
         { _id: userId },
         { deletedAt: new Date() },
         { runValidators: true }
      );
      if (withdrawalUser.nModified === 0) throw new ConflictError("탈퇴 실패");
   },
   //*사용자 찜 목록 조회
   async getWishListByType(payload, type, item, page) {
      type = (type === 'cocktail') ? 'cocktails' : (type === 'recipe' ? 'diyRecipes' : undefined);
      if (!type) throw new BadRequestError('잘못된 요청입니다.');
      //페이지당 아이템 수
      const limit = item === undefined || item === null ? 10 : item;
      const skip = page ? (page - 1) * limit : 0;
      // const userId = payload._id;
      const userId = new mongoose.Types.ObjectId(payload._id);
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
   //* 사용자 찜 추가
   async createWish(payload, id) {
      const userId = payload._id;
      const user = await User.findOne({ _id: userId, deletedAt: null }).lean();
      if (!user) throw new NotFoundError('사용자 정보 없음');
      if (user.wishes.cocktail.includes(id) || user.wishes.diyRecipe.includes(id)) {
         throw new ConflictError('찜 목록에 이미 아이템이 있음');
      }
      const result = await User.updateOne(
         { _id: userId },
         { $push: { 'wishes.cocktail': id, 'wishes.diyRecipe': id } },
         { runValidators: true }
      );
      if (result.modifiedCount === 0) {
         throw new InternalServerError('아이템 추가 실패');
      }
   },
   //* 사용자 찜 삭제
   async deleteWish(payload, id) {
      const userId = payload._id;
      // let userId = new mongoose.Types.ObjectId(payload._id);
      // 사용자 정보 확인
      const user = await User.findOne({ _id: userId, deletedAt: null }).lean();
      if (!user) throw new NotFoundError('사용자 정보 없음');
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
      if (result.modifiedCount === 0) {
         throw new ConflictError('아이템 삭제 실패');
      }
   },
   //* 사용자 권한 수정
   async updateUserPermission(userId) {
      const user = await User.findOne({ _id: userId, deletedAt: null }).lean();
      if (!user) throw new NotFoundError('사용자 정보 없음');
      const newPermission = !user.isWrite;
      await User.updateOne({ _id: userId }, { $set: { isWrite: newPermission } }, { runValidators: true });
   },
   //* 사용자 목록 조회
   async getUserList(item, page) {
      //페이지당 아이템 수
      const limit = item === undefined || item === null ? 10 : item;
      const skip = page ? (page - 1) * limit : 0;
      const userList = await User.find({}).select('_id email isWrite createAt updatedAt').skip(skip).limit(limit).lean();
      if (!userList) throw new NotFoundError('유저 정보 없음');
      return userList;
   },
   //* 사용자 삭제(관리자)
   async deleteUser(userId) {
      const user = await User.findOne({ _id: userId}).lean();
      if (!user) throw new NotFoundError('사용자 정보 없음');

      await CocktailReview.deleteMany({ user: userId });

      await DiyRecipeReview.deleteMany({ user: userId });

      await DiyRecipe.deleteMany({ user: userId });

      const result = await User.deleteOne({ _id: userId });
      if (result.deletedCount === 0) throw new ConflictError('삭제 데이터 없음');
   }
};

module.exports = userService;