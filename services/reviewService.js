const { default: mongoose } = require('mongoose');
const { User, Cocktail, DiyRecipe, CocktailReview, DiyRecipeReview } = require('../models');
const { BadRequestError, NotFoundError, ConflictError } = require('../utils/customError');
const setParameter = require('../utils/setParameter');

const reviewService = {
   //* 리뷰 검색(관리자)
   async getReviewListByKeyword(querys) {
      const { keyword, type, perPage, page } = querys;
      const { limit, skip, types } = setParameter(perPage, page, type);
      let query = {};
      let userIds = [];
      if (keyword) {
         const users = await User.find({ email: { $regex: keyword, $options: 'i' } });
         userIds = users.map(user => user._id);
         if (userIds.length === 0) throw new NotFoundError('일치하는 유저 없음');
         const query = userIds.length > 0 ? { user: { $in: userIds } } : {};
      }
      let results = [];
      // type별 검색
      for (let type of types) {
         const Model = type === 'CocktailReview' ? CocktailReview : DiyRecipeReview;
         const query = userIds.length > 0 ? { user: { $in: userIds } } : {};
         const reviews = await Model.find(query)
            .skip(skip)
            .limit(limit)
            .populate({ path: 'user', select: 'email' })
            .populate({ path: type === 'CocktailReview' ? 'cocktail' : 'diyRecipe', select: 'name' })
            .select('_id user cocktail diyRecipe createdAt')
            .lean();

         for (let review of reviews) {
            results.push({
               _id: review._id,
               email: review.user.email,
               type: type === 'CocktailReview' ? 'cocktail' : 'diyRecipe',
               name: review[type === 'CocktailReview' ? 'cocktail' : 'diyRecipe'].name,
               createdAt: review.createdAt
            });
         }
      }
      // if (!types.length < 3 && results.length === 0) throw new NotFoundError("검색 결과 없음");
      return results;
   }
   ,
   //* 리뷰 삭제(관리자)
   async deleteReview(reviewId) {
      const cocktailReview = await CocktailReview.findOne({ _id: reviewId }).lean();
      if (cocktailReview) {
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
      const diyRecipeReview = await DiyRecipeReview.findOne({ _id: reviewId });
      if (diyRecipeReview) {
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
      if (!cocktailReview || !diyRecipeReview) throw new NotFoundError('리뷰 없음');
   },
   //* 리뷰 목록 조회
   async getReviewList(id, perPage, page) {
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

         for (let review of reviews) {
            results.push({
               _id: review._id,
               nickname: review.user.nickname,
               content: review.content,
               images: review.images,
               rating: review.rating,
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
      const { limit, skip, types } = setParameter(perPage, page, type);
      const dateFromId = cursorId ? new Date(parseInt(cursorId.substring(0, 8), 16) * 1000) : null;
      let results = {};
  
      for (let type of types) {
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
              { $lookup: { from: type === 'CocktailReview' ? 'cocktails' : 'diyRecipes', localField: type === 'CocktailReview' ? 'cocktail' : 'diyRecipe', foreignField: '_id', as: 'item' } },
              { $unwind: '$item' },
              { $project: { _id: 1, type: type === 'CocktailReview' ? 'cocktail' : 'diyRecipe', name: '$item.name', rating: 1, content: 1, images: 1, createdAt: 1 } },
              { $skip: skip },
              { $limit: limit },
          ];
  
          const countData = { user: userId };
  
          const runPipeline = async () => {
              const data = await Model.aggregate(pipelineData);
              const size = await Model.countDocuments(countData);
              return { size, data };
          };
  
          const { size, data } = await runPipeline();
          results[type + 'Size'] = size;

          const groupedData = data.reduce((acc, review) => {
              const monthYear = `${review.createdAt.getFullYear()}-${review.createdAt.getMonth() + 1}`;
              if (!acc[monthYear]) {
                  acc[monthYear] = { date: monthYear, list: [] };
              }
              acc[monthYear].list.push(review);
              return acc;
          }, {});

          results[type + 's'] = Object.values(groupedData);
      }
  
      return results;
  },
   //* 리뷰 수정
   async updateReview(userId, id, type, data) {
      const { content, images, rating } = data;
      const models = {
         'cocktails': CocktailReview,
         'recipes': DiyRecipeReview
      };
      const model = models[type];
      if (!model) throw new BadRequestError('타입 오류');
      const updateItem = await model.updateOne(
         { user: userId, _id: id },
         { content, images, rating },
         { runValidators: true });
      if (updateItem.matchedCount === 0) throw new NotFoundError('해당 리뷰 없음');
      if (updateItem.modifiedCount === 0) throw new ConflictError('수정한 데이터 없음');
   }
   ,
   //* 리뷰 등록
   async createReview(userId, itemId, type, data) {
      const { content, images, rating } = data;
      const models = {
         'cocktails': CocktailReview,
         'recipes': DiyRecipeReview
      };
      const model = models[type];

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
   async deleteUserReview(userId, reviewId) {
      const cocktailReview = await CocktailReview.findOne({ _id: reviewId, user: userId }).lean();
      if (cocktailReview) {
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
      const diyRecipeReview = await DiyRecipeReview.findOne({ _id: reviewId, user: userId });
      if (diyRecipeReview) {
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
      if (!cocktailReview || !diyRecipeReview) throw new NotFoundError('리뷰 없음');
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
         return await DiyRecipeReview.updateOne(id, { $push: { likes: userId } }, { runValidators: true });
      }
   },
   //* 좋아요 삭제
   async deleteLike(userId, id) {
      const cocktailReview = await CocktailReview.findById(id).lean();
      const diyRecipeReview = await DiyRecipeReview.findById(id).lean();
      if (!cocktailReview && !diyRecipeReview) throw new NotFoundError('일치 데이터 없음');

      if (!cocktailReview.likes.includes(userId)) throw new ConflictError('이미 좋아요를 누름');
      else if (cocktailReview.likes.includes(userId)) return await CocktailReview.UpdateOne(id, { $push: { likes: userId } }, { runValidators: true });

      if (!diyRecipeReview.likes.includes(userId)) throw new ConflictError('이미 좋아요를 누름');
      else if (diyRecipeReview.likes.includes(userId)) return await DiyRecipeReview.UpdateOne(id, { $push: { likes: userId } }, { runValidators: true });
   }
};
module.exports = reviewService;