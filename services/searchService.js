const Cocktail = require('../models/cocktailModel');
const DiyRecipe = require('../models/diyRecipeModel');
const Base = require('../models/baseModel');
const CocktailReview = require('../models/cocktailReviewModel');
const DiyRecipeReview = require('../models/diyRecipeReviewModel');
const Bar = require('../models/barModel');
const { NotFoundError, BadRequestError } = require('../utils/customError');
const searchService = {
   async a() {
      await CocktailReview.find();
      await DiyRecipeReview.find();
      await Bar.find();
   },
   async searchByKeyword(keyword, type, sort, item, page) {
      //페이지당 아이템 수
      const limit = item === undefined || item === null ? 10 : item;
      const skip = page ? (page - 1) * limit : 0;
      // base 검색
      const base = await Base.find({ name: { $regex: keyword, $options: 'i' } }).select('_id').lean();
      const baseIds = base.map(base => base._id);

      const types = (type === 'cocktail' ? ['cocktail']
         : type === 'recipe' ? ['diyRecipe']
            : type === undefined || type === null ? ['cocktail', 'diyRecipe']
               : (() => { throw new BadRequestError('타입 오류'); })());

      let results = {};
      // type별 검색
      for (let type of types) {
         const Model = type === 'cocktail' ? Cocktail : DiyRecipe;
         const items = await Model.find({
            $or: [
               { name: { $regex: keyword, $options: 'i' } },
               { base: { $in: baseIds } }
            ],
         }).populate('base').populate({ path: 'reviews', select: 'rating' }).skip(skip).limit(item).lean();
         if (types.length < 3 && !items.length === 0) throw new NotFoundError("검색 결과가 없음");
         // 평균 별점& 리뷰 숫자 계산.
         let itemResults = [];
         for (let item of items) {
            const avgRating = item.reviews.reduce((acc, reviews) => acc + reviews.rating, 0) / item.reviews.length;
            const reviewCount = item.reviews.length;
            itemResults.push({
               _id: item._id,
               name: item.name,
               image: item.image,
               avgRating,
               reviewCount
            });
         }

         // 정렬 적용
         let sortedItems;
         switch (sort) {
            case 'rating':
               sortedItems = itemResults.sort((a, b) => b.avgRating - a.avgRating);
               break;
            case 'review':
               sortedItems = itemResults.sort((a, b) => b.reviewCount - a.reviewCount);
               break;
            default:
               sortedItems = itemResults;
         }
         results[type] = sortedItems;
      }
      return results;
   },

};

module.exports = searchService;