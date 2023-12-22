const { default: mongoose } = require('mongoose');
const { User, Cocktail, DiyRecipe, CocktailReview, DiyRecipeReview } = require('../models');
const { BadRequestError, NotFoundError, ConflictError } = require('../utils/customError');
const setParameter = require('../utils/setParameter');

const reviewService = {
   //* 리뷰 검색(관리자)
   async getReviewListByKeyword(keyword, type, cursorId, cursorSort, cursorValue, perPage) {
      let userIds = [];
      if (keyword) {
          const users = await User.find({ email: { $regex: keyword, $options: 'i' } });
          userIds = users.map(user => user._id);
          if (userIds.length === 0) throw new NotFoundError('일치하는 유저 없음');
      }
      let results = [];
      // type별 검색
      const types = type ? [type] : ['cocktails', 'recipe'];
      for (let type of types) {
          const Model = type === 'cocktails' ? CocktailReview : DiyRecipeReview;
          let query = userIds.length > 0 ? { user: { $in: userIds } } : {};
          if (cursorId) {
              query._id = { $lt: cursorId };
          }
          if (cursorSort) {
              query[cursorSort] = { $lt: cursorValue };
          }
          const reviews = await Model.find(query)
              .sort({ [cursorSort]: -1 })
              .limit(perPage)
              .populate({ path: 'user', select: 'email' })
              .populate({ path: type === 'cocktails' ? 'cocktail' : 'diyRecipe', select: 'name' })
              .select('_id user cocktail diyRecipe createdAt')
              .lean();
  
          for (let review of reviews) {
              results.push({
                  _id: review._id,
                  email: review.user.email,
                  type: type === 'cocktails' ? 'cocktail' : 'diyRecipe',
                  name: review[type === 'cocktails' ? 'cocktail' : 'diyRecipe'].name,
                  createdAt: review.createdAt
              });
          }
      }
      if (!types.length < 3 && results.length === 0) throw new NotFoundError("검색 결과 없음");
      return results;
  },
   //* 리뷰 삭제(관리자)
   async deleteReview(id) {
      const cocktailReview = await CocktailReview.findById(id);
      if (cocktailReview) {
         await CocktailReview.deleteOne({ _id: id });
         const cocktail = await Cocktail.findOne({ reviews: id });
         if (cocktail) {
            cocktail.reviews.pull(id);
            await cocktail.save();
         }
         return;
      }
      const diyRecipeReview = await DiyRecipeReview.findById(id);
      if (diyRecipeReview) {
         await DiyRecipeReview.deleteOne({ _id: id });
         const diyRecipe = await DiyRecipe.findOne({ reviews: id });
         if (diyRecipe) {
            diyRecipe.reviews.pull(id);
            await diyRecipe.save();
         }
         return;
      }
      throw new NotFoundError('리뷰 없음');
   }
   ,
   //* 리뷰 목록 조회
   async getReviewList(id, item, page) {
      const { limit, skip } = setParameter(item, page);
      let results = [];
      const models = [CocktailReview, DiyRecipeReview];
      const modelNames = ['cocktail', 'diyRecipe'];

      for (let i = 0; i < models.length; i++) {
         const reviews = await models[i].find({ [modelNames[i]]: id })
            .skip(skip)
            .limit(limit)
            .populate({ path: 'user', select: 'email' })
            .lean();

         for (let review of reviews) {
            results.push({
               _id: review._id,
               email: review.user.email,
               content: review.content,
               images: review.images,
               rating: review.rating,
               likesCount: review.likes.length,
               createdAt: review.createdAt
            });
         }
      }
      if (results.length === 0) throw new NotFoundError('리뷰 없음');
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
   async getUserReviewList(userId, type, item, page) {
      const { limit, skip, types } = setParameter(item, page, type);
      let results = {};
      let totalItems = 0;
      for (let type of types) {
         const Model = type === 'CocktailReview' ? CocktailReview : DiyRecipeReview;
         const reviews = await Model.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate(type === 'CocktailReview' ? 'cocktail' : 'diyRecipe')
            .lean();
         if (reviews.length === 0) throw new NotFoundError('해당 유저의 리뷰 없음');
         for (let review of reviews) {
            // 2개의 리뷰 합친 수 = 페이지당 item 수 
            if (totalItems >= skip + limit) {
               break;
            }
            if (totalItems >= skip) {
               const monthYear = `${review.createdAt.getFullYear()}-${review.createdAt.getMonth() + 1}`;
               if (!results[monthYear]) {
                  results[monthYear] = [];
               }
               results[monthYear].push({
                  _id: review._id,
                  type: type === 'CocktailReview' ? 'cocktail' : 'diyRecipe',
                  name: review[type === 'CocktailReview' ? 'cocktail' : 'diyRecipe'].name,
                  rating: review.rating,
                  content: review.content,
                  image: review.images,
                  createdAt: review.createdAt
               });
            }
            totalItems++;
         }
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
   },
   //* 리뷰 삭제
   async deleteUserReview(userId, reviewId) {
      const cocktailReview = await CocktailReview.findOne({ _id: reviewId, user: userId });
      if (cocktailReview) {
         await CocktailReview.deleteOne({ _id: reviewId });
         const cocktail = await Cocktail.findOne({ reviews: reviewId });
         if (cocktail) {
            cocktail.reviews.pull(reviewId);
            await cocktail.save();
         }
         return;
      }
      const diyRecipeReview = await DiyRecipeReview.findOne({ _id: reviewId, user: userId });
      if (diyRecipeReview) {
         await DiyRecipeReview.deleteOne({ _id: reviewId });
         const diyRecipe = await DiyRecipe.findOne({ reviews: reviewId });
         if (diyRecipe) {
            diyRecipe.reviews.pull(reviewId);
            await diyRecipe.save();
         }
         return;
      }
      throw new NotFoundError('리뷰 없음');
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