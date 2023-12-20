const { User, Cocktail, DiyRecipe, CocktailReview, DiyRecipeReview } = require('../models');
const { BadRequestError, NotFoundError, ConflictError } = require('../utils/customError');
const setParameter = require('../utils/setParameter');

const reviewService = {
   //* 리뷰 검색(관리자)
   async getReviewListByKeyword(keyword, type, item, page) {
      const { limit, skip, types } = setParameter(item, page, type);
      let userIds = [];
      if (keyword) {
         const users = await User.find({ email: { $regex: keyword, $options: 'i' } });
         userIds = users.map(user => user._id);
         if (userIds.length === 0) throw new NotFoundError('일치하는 유저 없음');
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
               type: type === 'CocktailReview' ? 'cocktail' : 'diyRecipe',
               name: review[type === 'CocktailReview' ? 'cocktail' : 'diyRecipe'].name,
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
   async getReview(id) {
      const models = [CocktailReview, DiyRecipeReview];
      for (let model of models) {
         const review = await model.findById(id).populate({ path: 'user', select: 'email' }).lean();
         if (review) {
            return {
               _id: review._id,
               email: review.user.email,
               content: review.content,
               images: review.images,
               rating: review.rating,
               likesCount: review.likes.length,
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
         'cocktail': CocktailReview,
         'recipe': DiyRecipeReview
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
         'cocktail': CocktailReview,
         'recipe': DiyRecipeReview
      };
      const model = models[type];

      if (!model) throw new BadRequestError('타입 오류');
      const modelName = type === 'cocktail' ? 'cocktail' : 'diyRecipe';
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
   }
};
module.exports = reviewService;