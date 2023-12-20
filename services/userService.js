const { User, CocktailReview, DiyRecipeReview, DiyRecipe, Cocktail } = require('../models');
const { BadRequestError, ConflictError, NotFoundError, InternalServerError, } = require('../utils/customError');
const mongoose = require('mongoose');
const setToken = require('../utils/setToken');
const userService = {
   //* JWT 토큰에 할당될 사용자 정보
   async getUserTokenPayLoad(userId) {
      const user = await User.findOne({ _id: userId, deletedAt: null }).select('_id isAdmin isWrite').lean();
      if (!user) throw new NotFoundError('유저 정보 없음');
      return user;
   },
   //* 사용자 정보 조회
   async getUser(userId) {
      const user = await User.findOne({ _id: userId, deletedAt: null }).select('_id email nickname createdAt updatedAt').lean();
      if (!user) throw new NotFoundError("사용자 정보 없음");
      return user;
   },
   //* 사용자 정보 수정
   async updateUser(userId, email, nickname) {
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
   async withdrawal(userId) {
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
   async getWishListByType(userId, type, item, page) {
      type = (type === 'cocktails') ? 'cocktails' : (type === 'recipes' ? 'diyRecipes' : undefined);
      if (!type) throw new BadRequestError('잘못된 요청입니다.');
      //페이지당 아이템 수
      const limit = item === undefined || item === null ? 10 : item;
      const skip = page ? (page - 1) * limit : 0;

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
   async createWish(userId, id) {
      const user = await User.findOne({ _id: userId, deletedAt: null }).lean();
      if (!user) throw new NotFoundError('사용자 정보 없음');

      if (user.wishes.cocktails.map(String).includes(id.toString()) || user.wishes.diyRecipes.map(String).includes(id.toString())) {
         throw new ConflictError('찜 목록에 이미 아이템이 있음');
      }
      const foundCocktail = Cocktail.findOne({ _id: id });
      if (foundCocktail) {
         await User.updateOne(
            { _id: userId },
            { $push: { 'wishes.cocktails': id, } },
            { runValidators: true }
         );
         return;
      }
      const foundDiyRecipe = DiyRecipe.findOne({ _id: id });
      if (foundDiyRecipe) {
         await User.updateOne(
            { _id: userId },
            { $push: { 'wishes.diyRecipes': id, } },
            { runValidators: true }
         );
         return;
      }
   },
   //* 사용자 찜 삭제
   async deleteWish(userId, id) {
      // 사용자 정보 확인
      const user = await User.findOne({ _id: userId, deletedAt: null }).lean();
      if (!user) throw new NotFoundError('사용자 정보 없음');
      if (!user.wishes.cocktails.map(String).includes(id.toString()) && !user.wishes.diyRecipes.map(String).includes(id.toString())) {
         throw new NotFoundError('찜 목록에 아이템이 없음');
      }
      const foundCocktail = Cocktail.findOne({ _id: id });
      if (foundCocktail) {
         await User.updateOne(
            { _id: userId },
            { $pull: { 'wishes.cocktails': id, } },
            { runValidators: true }
         );
         return;
      }
      const foundDiyRecipe = DiyRecipe.findOne({ _id: id });
      if (foundDiyRecipe) {
         await User.updateOne(
            { _id: userId },
            { $pull: { 'wishes.diyRecipes': id, } },
            { runValidators: true }
         );
         return;
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
      const user = await User.findOne({ _id: userId }).lean();
      if (!user) throw new NotFoundError('사용자 정보 없음');

      await CocktailReview.deleteMany({ user: userId });

      await DiyRecipeReview.deleteMany({ user: userId });

      await DiyRecipe.deleteMany({ user: userId });

      const result = await User.deleteOne({ _id: userId });
      if (result.deletedCount === 0) throw new ConflictError('삭제 데이터 없음');
   },
   async login(data) {
      const { id, pw } = data;
      const user = await User.findOne({ id: id, pw: pw });
      if (!user) throw new NotFoundError('없어여');
      const result = setToken(user);
      return result;
   },
};

module.exports = userService;