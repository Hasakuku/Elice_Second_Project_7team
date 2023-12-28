const { User, CocktailReview, DiyRecipeReview, DiyRecipe, Cocktail, Base } = require('../models');
const { BadRequestError, ConflictError, NotFoundError, InternalServerError, } = require('../utils/customError');
const mongoose = require('mongoose');
const setToken = require('../utils/setToken');
const setParameter = require('../utils/setParameter');
const userService = {
   //* JWT 토큰에 할당될 사용자 정보
   async getUserTokenPayLoad(userId) {
      const user = await User.findOne({ _id: userId, deletedAt: null }).select('_id isAdmin isWrite').lean();
      if (!user) throw new NotFoundError('유저 정보 없음');
      return user;
   },
   //* 사용자 정보 조회
   async getUser(userId) {
      const user = await User.findOne({ _id: userId, deletedAt: null }).select('_id email nickname createdAt updatedAt isAdmin isWrite').lean();
      if (!user) throw new NotFoundError("사용자 정보 없음");
      return user;
   },
   //* 사용자 정보 수정
   async updateUser(userId, { email, nickname }) {
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
   async getWishListByType(userId, { cursorId, page, perPage, type }) {
      if (!type) throw new BadRequestError('타입을 입력해주세요');
      const types = type === 'cocktails' ? 'cocktails' : 'diyRecipes';
      const { skip, limit } = setParameter(perPage, page);
      const dateFromId = cursorId ? new Date(parseInt(cursorId.substring(0, 8), 16) * 1000) : null;

      const user = await User.findById(userId);
      if (!user) throw new NotFoundError("존재하지 않는 사용자입니다.");

      let matchData = {
         $and: [
            { _id: { $in: user.wishes[types], $ne: new mongoose.Types.ObjectId(cursorId) } }
         ],
      };

      const countData = { _id: { $in: user.wishes[types] } };

      const addCursorCondition = (key, value) => {
         const condition1 = { [key]: { $lt: value } };
         const condition2 = { [key]: value, createdAt: { $lt: dateFromId } };
         matchData.$and.push({ $or: [condition1, condition2] });
      };

      if (cursorId) {
         addCursorCondition('createdAt', dateFromId);
      }

      const pipelineData = [
         { $match: matchData },
         { $sort: { createdAt: -1 } },
      ];
      if (page) {
         pipelineData.push({ $skip: skip });
      }
      pipelineData.push({ $limit: limit }, { $project: { _id: 1, name: 1, avgRating: 1, reviewCount: 1, createdAt: 1, image: 1 } },);

      const runPipeline = async (model) => {
         const data = await model.aggregate(pipelineData);
         const size = await model.countDocuments(countData);
         return { size, data };
      };
      let results = {};
      if (type === 'cocktails') {
         const { size, data } = await runPipeline(Cocktail);
         results['cocktailSize'] = size;
         results['cocktails'] = data;
         return results;
      } else if (type === 'recipes') {
         const { size, data } = await runPipeline(DiyRecipe);
         results['diyRecipeSize'] = size;
         results['diyRecipes'] = data;
         return results;
      }

      return results;
   },

   //* 사용자 찜 추가
   async createWish(userId, id) {
      const user = await User.findOne({ _id: userId, deletedAt: null }).lean();
      if (!user) throw new NotFoundError('사용자 정보 없음');

      if (user.wishes.cocktails.map(String).includes(id.toString()) || user.wishes.diyRecipes.map(String).includes(id.toString())) {
         return;
      }

      const foundCocktail = await Cocktail.findOne({ _id: id }).lean();
      if (foundCocktail) {
         await User.updateOne(
            { _id: userId },
            { $push: { 'wishes.cocktails': id, } },
            { runValidators: true }
         );
         await Cocktail.updateOne(
            { _id: id },
            { $push: { 'wishes': userId } },
            { runValidators: true }
         );
         return;
      }
      const foundDiyRecipe = await DiyRecipe.findOne({ _id: id });
      if (foundDiyRecipe) {
         await User.updateOne(
            { _id: userId },
            { $push: { 'wishes.diyRecipes': id, } },
            { runValidators: true }
         );
         await DiyRecipe.updateOne(
            { _id: id },
            { $push: { 'wishes': userId } },
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
         return;
      }
      const foundCocktail = await Cocktail.findOne({ _id: id });
      if (foundCocktail) {
         await User.updateOne(
            { _id: userId },
            { $pull: { 'wishes.cocktails': id, } },
            { runValidators: true }
         );
         await Cocktail.updateOne(
            { _id: id },
            { $pull: { 'wishes': userId } },
            { runValidators: true }
         );
         return;
      }
      const foundDiyRecipe = await DiyRecipe.findOne({ _id: id });
      if (foundDiyRecipe) {
         await User.updateOne(
            { _id: userId },
            { $pull: { 'wishes.diyRecipes': id, } },
            { runValidators: true }
         );
         await DiyRecipe.updateOne(
            { _id: id },
            { $pull: { 'wishes': userId } },
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
   async getUserList({ keyword, perPage, page }) {
      const { limit, skip } = setParameter(perPage, page);
      const total = await User.countDocuments(
         keyword ? { email: { $regex: keyword, $options: 'i' } } : {}
      );

      const pipeline = [
         ...(keyword ? [{ $match: { email: { $regex: keyword, $options: 'i' } } }] : []),
         {
            $project: {
               _id: 1,
               email: 1,
               isWrite: 1,
               createAt: 1,
               updatedAt: 1,
            },
         },
         { $skip: skip },
         { $limit: limit },
      ];

      const users = await User.aggregate(pipeline);
      return { total, users };
   },

   //* 사용자 삭제(관리자)
   async deleteUser(userId) {
      const user = await User.findOne({ _id: userId }).lean();
      if (!user) throw new NotFoundError('사용자 정보 없음');
      const cocktailReviews = await CocktailReview.find({ user: userId });
      for (let review of cocktailReviews) {

         let cocktail = await Cocktail.findOne({ reviews: review._id });
         if (cocktail) {
            cocktail.reviews.pull(review._id);
            await cocktail.save();
         }
      }
      const diyRecipeReview = await DiyRecipeReview.find({ reviews: userId });
      for (let review of diyRecipeReview) {

         let diyRecipe = await DiyRecipe.findOne({ reviews: review._id });
         if (diyRecipe) {
            diyRecipe.reviews.pull(review._id);
            await diyRecipe.save();
         }
      }

      await CocktailReview.deleteMany({ user: userId });

      await DiyRecipeReview.deleteMany({ user: userId });

      await DiyRecipe.deleteMany({ user: userId });

      const result = await User.deleteOne({ _id: userId });
      if (result.deletedCount === 0) throw new ConflictError('삭제 데이터 없음');
   },
   //* 기본 로그인
   async login({ id, pw }) {
      if(!id || !pw) throw new BadRequestError('id 와 pw를 입력해주세요');
      const user = await User.findOne({ id: id, pw: pw });
      if (!user) throw new NotFoundError('없어여');
      const result = setToken(user);
      return result;
   },
   //* 사용자 커스텀 설정
   async updateUserCustom(userId, { base, abv, taste, level }) {
      const user = await User.findById(userId);
      if (!user) throw new NotFoundError('유저 정보 없음');
      if (!abv || !taste || !level) throw new BadRequestError('도수,맛,단계를 입력하세요');
      if (!['sweet', 'sour', 'bitter'].includes(taste) || !['1', '2', '3'].includes(level)) {
         throw new BadRequestError('올바른 정보로 요청 해주세요');
      }
      if (base && await Base.find({ name: base }).select('_id').lean()) throw new NotFoundError('Base 값 오류');
      user.custom = {
         base: base || undefined,
         abv: abv,
         [taste]: level
      };
      await user.save();
   },
};

module.exports = userService;