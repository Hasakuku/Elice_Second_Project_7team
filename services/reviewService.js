const { default: mongoose } = require('mongoose');
const { User, Cocktail, DiyRecipe, CocktailReview, DiyRecipeReview } = require('../models');
const { BadRequestError, NotFoundError, ConflictError, InternalServerError } = require('../utils/customError');
const setParameter = require('../utils/setParameter');
const fs = require('fs').promises;
const path = require('path');

const reviewService = {
   //* 리뷰 검색(관리자)
   async getReviewListByKeyword(querys) {
      const { keyword, type, perPage, page } = querys;
      const { limit, skip, types } = setParameter(perPage, page, type);
      let userIds = [];
      if (keyword) {
         const users = await User.find({ email: { $regex: keyword, $options: 'i' } });
         userIds = users.map(user => user._id);
      }
      let results = [];
      // type별 검색
      for (let type of types) {
         const Model = type === 'CocktailReview' ? CocktailReview : DiyRecipeReview;
         const pipeline = [
            { $match: userIds.length > 0 ? { user: { $in: userIds } } : {} },
            { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            { $lookup: { from: type === 'CocktailReview' ? 'cocktails' : 'diyrecipes', localField: type === 'CocktailReview' ? 'cocktail' : 'diyRecipe', foreignField: '_id', as: type === 'CocktailReview' ? 'cocktail' : 'diyRecipe' } },
            { $unwind: type === 'CocktailReview' ? '$cocktail' : '$diyRecipe' },
            { $project: { _id: 1, email: '$user.email', type: type === 'CocktailReview' ? 'cocktail' : 'diyRecipe', name: type === 'CocktailReview' ? '$cocktail.name' : '$diyRecipe.name', createdAt: 1 } },
         ];
         const reviews = await Model.aggregate(pipeline);
         results.push(...reviews);
      }
      results.sort((a, b) => b.createdAt - a.createdAt);
      return { total: results.length, reviews: results.slice(skip, skip + limit) };
   },

   //* 리뷰 목록 조회
   async getReviewList(user, { perPage, page, id }) {
      const { limit, skip } = setParameter(perPage, page);
      let results = [];
      const models = [CocktailReview, DiyRecipeReview];
      const modelNames = ['cocktail', 'diyRecipe'];

      for (let i = 0; i < models.length; i++) {
         const reviews = await models[i].find({ [modelNames[i]]: id })
            .skip(skip)
            .limit(limit)
            .populate({ path: 'user', select: 'nickname' })
            .lean();
         let userId = user ? user.id.toString() : '';
         for (let review of reviews) {
            results.push({
               _id: review._id,
               nickname: review.user.nickname,
               content: review.content,
               images: review.images,
               rating: review.rating,
               isLiked: Array.isArray(review.likes) && review.likes.map(like => like.toString()).includes(userId),
               likesCount: review.likes.length,
               createdAt: review.createdAt
            });
         }
      }
      // if (results.length === 0) throw new NotFoundError('리뷰 없음');
      return results;
   },
   //* 리뷰 상세 조회
   async getReview(userId, id) {
      const models = [CocktailReview, DiyRecipeReview];
      for (let model of models) {
         const review = await model.findOne({ _id: id, user: userId }).populate({ path: 'user', select: 'email' }).lean();
         if (review) {
            return {
               _id: review._id,
               email: review.user.email,
               content: review.content,
               images: review.images,
               rating: review.rating,
               likeCount: review.likes.length,
               createdAt: review.createdAt
            };
         }
      }
      throw new NotFoundError('리뷰 없음');
   },
   //* 유저 리뷰 목록 조회
   async getUserReviewList(userId, query) {
      const { cursorId, type, perPage, page } = query;
      const { limit, skip } = setParameter(perPage, page, type);
      const dateFromId = cursorId ? new Date(parseInt(cursorId.substring(0, 8), 16) * 1000) : null;
      let results = { total: 0, data: {} };
  
      const types = type ? [type] : ['CocktailReview', 'DiyRecipeReview'];
  
      let totalFetched = 0;
  
      for (let type of types) {
          if (totalFetched >= limit) break;
  
          const Model = type === 'CocktailReview' ? CocktailReview : DiyRecipeReview;
          let matchData = {
              $and: [
                  { user: userId },
                  { _id: { $ne: new mongoose.Types.ObjectId(cursorId) } }
              ],
          };
  
          if (cursorId) {
              matchData.$and.push({
                  $or: [
                      { createdAt: { $lt: dateFromId } },
                      { createdAt: dateFromId, _id: { $lt: cursorId } }
                  ]
              });
          }
  
          const pipelineData = [
              { $match: matchData },
              { $sort: { createdAt: -1 } },
              { $lookup: { from: type === 'CocktailReview' ? 'cocktails' : 'diyrecipes', localField: type === 'CocktailReview' ? 'cocktail' : 'diyRecipe', foreignField: '_id', as: 'item' } },
              { $unwind: '$item' },
              { $project: { _id: 1, type: type === 'CocktailReview' ? 'cocktail' : 'diyRecipe', name: '$item.name', rating: 1, content: 1, images: 1, createdAt: 1, likes: 1 } },
              { $skip: skip },
              { $limit: limit - totalFetched },
          ];
  
          const countData = { user: userId };
  
          const runPipeline = async () => {
              let data = await Model.aggregate(pipelineData);
              const size = await Model.countDocuments(countData);
              data = data.map(item => {
                  const { likes, ...rest } = item;
                  return {
                      ...rest,
                      isLiked: Array.isArray(likes) && likes.map(like => like.toString()).includes(userId),
                  };
              });
              return { size, data };
          };
  
          const { size, data } = await runPipeline();
          totalFetched += data.length;
  
          for (let review of data) {
              const monthYear = `${review.createdAt.getFullYear()}-${review.createdAt.getMonth() + 1}`;
              if (!results.data[monthYear]) {
                  results.data[monthYear] = { date: monthYear, list: [] };
              }
              results.data[monthYear].list.push(review);
          }
      }
      if (type === 'cocktails') {
          results.total = await CocktailReview.countDocuments({ user: userId });
      } else if (type === 'recipes') {
          results.total = await DiyRecipeReview.countDocuments({ user: userId });
      } else {
          results.total = await CocktailReview.countDocuments({ user: userId }) + await DiyRecipeReview.countDocuments({ user: userId });
      }
      results.data = Object.values(results.data);
      return results;
  },
   //* 리뷰 수정
   async updateReview(userId, id, type, data) {
      const { content, rating, newImageNames } = data;

      const models = {
         'cocktails': CocktailReview,
         'recipes': DiyRecipeReview
      };
      const model = models[type];
      const foundReview = await model.findOne({ _id: id, user: userId }).lean();
      let images;
      if (newImageNames.length !== 0 && Array.isArray(newImageNames)) {
         for (let i = 0; i < newImageNames.length; i++) {
            if (foundReview.images && foundReview.images[i]) {
               const imagePath = path.join(__dirname, '../images', foundReview.images[i]);
               await fs.unlink(imagePath).catch(err => {
                  if (err.code !== 'ENOENT') {
                     throw new InternalServerError('이미지 삭제 실패');
                  }
               });
            }
         }
         images = newImageNames.map(image => image.imageName);
      }

      if (!model) throw new BadRequestError('타입 오류');
      const updateItem = await model.updateOne(
         { user: userId, _id: id },
         { content, images, rating },
         { runValidators: true });
      if (updateItem.matchedCount === 0) throw new NotFoundError('해당 리뷰 없음');
      if (updateItem.modifiedCount === 0) throw new ConflictError('수정한 데이터 없음');
   },

   //* 리뷰 등록
   async createReview(userId, itemId, type, data) {
      const { content, rating, newImageNames } = data;
      const models = {
         'cocktails': CocktailReview,
         'recipes': DiyRecipeReview
      };
      const model = models[type];
      //이미지
      let images;

      if (newImageNames.length !== 0 && Array.isArray(newImageNames)) {
         images = newImageNames.map(image => image.imageName);
      }

      if (!model) throw new BadRequestError('타입 오류');
      const modelName = type === 'cocktails' ? 'cocktail' : 'diyRecipe';
      const review = new model({
         user: userId,
         [modelName]: itemId,
         content, images, rating,
      });
      await review.save();

      const reviews = await model.find({ [modelName]: itemId });
      let avgRating = 0;
      reviews.forEach((review) => {
         avgRating += review.rating;
      });
      avgRating /= reviews.length;
      let reviewCount = reviews.length;
      if (type === 'cocktails') await Cocktail.updateOne({ _id: itemId }, { avgRating: avgRating.toFixed(2), reviewCount: reviewCount });
      if (type === 'recipes') await DiyRecipe.updateOne({ _id: itemId }, { avgRating: avgRating.toFixed(2), reviewCount: reviewCount });
   },
   //* 리뷰 삭제
   async deleteReview(user, reviewId) {
      let cocktailReview;
      if (!user.isAdmin) cocktailReview = await CocktailReview.findOne({ _id: reviewId, user: user._id }).lean();
      else cocktailReview = await CocktailReview.findById(reviewId).lean();
      if (cocktailReview) {
         for (let image of cocktailReview.images) {
            const imagePath = path.join(__dirname, '../images', image);
            await fs.unlink(imagePath).catch(err => {
               if (err.code !== 'ENOENT') {
                  throw new InternalServerError('이미지 삭제 실패');
               }
            });
         }
         await CocktailReview.deleteOne({ _id: reviewId });
         const cocktail = await Cocktail.findOne({ reviews: reviewId });
         if (cocktail) {
            cocktail.reviews.pull(reviewId);

            const result = await CocktailReview.aggregate([
               { $match: { cocktail: cocktail._id } },
               {
                  $group: {
                     _id: null,
                     avgRating: { $avg: "$rating" },
                     reviewCount: { $sum: 1 }
                  }
               }
            ]);

            cocktail.avgRating = result[0] ? result[0].avgRating : 0;
            cocktail.reviewCount = result[0] ? result[0].reviewCount : 0;
            await cocktail.save();
            return;
         }
      }
      let diyRecipeReview;
      if (!user.isAdmin) diyRecipeReview = await DiyRecipeReview.findOne({ _id: reviewId, user: user._id }).lean();
      else diyRecipeReview = await DiyRecipeReview.findById(reviewId).lean();
      diyRecipeReview = await DiyRecipeReview.findOne({ _id: reviewId, user: user._id });
      if (diyRecipeReview) {
         for (let image of diyRecipeReview.images) {
            const imagePath = path.join(__dirname, '../images', image);
            await fs.unlink(imagePath).catch(err => {
               if (err.code !== 'ENOENT') {
                  throw new InternalServerError('이미지 삭제 실패');
               }
            });
         }
         await DiyRecipeReview.deleteOne({ _id: reviewId });
         const diyRecipe = await DiyRecipe.findOne({ reviews: reviewId });
         if (diyRecipe) {
            diyRecipe.reviews.pull(reviewId);
            const result = await DiyRecipeReview.aggregate([
               { $match: { diyRecipe: diyRecipe._id } },
               {
                  $group: {
                     _id: null,
                     avgRating: { $avg: "$rating" },
                     reviewCount: { $sum: 1 }
                  }
               }
            ]);

            diyRecipe.avgRating = result[0] ? result[0].avgRating : 0;
            diyRecipe.reviewCount = result[0] ? result[0].reviewCount : 0;
            await diyRecipe.save();
         }
         return;
      }
      if (!cocktailReview && !diyRecipeReview) throw new NotFoundError('리뷰 없음');
   },
   //* 좋아요 추가
   async addLike(userId, id) {
      const cocktailReview = await CocktailReview.findById(id).lean();
      const diyRecipeReview = await DiyRecipeReview.findById(id).lean();
      if (!cocktailReview && !diyRecipeReview) throw new NotFoundError('일치 데이터 없음');
      else if (cocktailReview) {
         const userLiked = cocktailReview.likes.map(String).includes(userId.toString());
         if (userLiked) throw new ConflictError('이미 좋아요를 누름');
         return await CocktailReview.updateOne({ _id: id }, { $push: { likes: userId } }, { runValidators: true });
      }

      else if (diyRecipeReview) {
         const userLiked = diyRecipeReview.likes.map(String).includes(userId.toString());
         if (userLiked) throw new ConflictError('이미 좋아요를 누름');
         return await DiyRecipeReview.updateOne({ _id: id }, { $push: { likes: userId } }, { runValidators: true });
      }
   },
   //* 좋아요 삭제
   async deleteLike(userId, id) {
      const cocktailReview = await CocktailReview.findById(id).lean();
      const diyRecipeReview = await DiyRecipeReview.findById(id).lean();
      if (!cocktailReview && !diyRecipeReview) throw new NotFoundError('일치 데이터 없음');
      else if (cocktailReview) {
         const userLiked = cocktailReview.likes.map(String).includes(userId.toString());
         if (!userLiked) throw new NotFoundError('좋아요가 없음');
         return await CocktailReview.updateOne({ _id: id }, { $pull: { likes: userId } }, { runValidators: true });
      } else if (diyRecipeReview) {
         const userLiked = diyRecipeReview.likes.map(String).includes(userId.toString());
         if (!userLiked) throw new NotFoundError('좋아요가 없음');
         return await DiyRecipeReview.updateOne({ _id: id }, { $pull: { likes: userId } }, { runValidators: true });
      }
   }
};
module.exports = reviewService;