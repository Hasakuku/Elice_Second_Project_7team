const Cocktail = require('../models/cocktailModel');
const DiyRecipe = require('../models/diyRecipeModel');
const Base = require('../models/baseModel')
const CocktailReview = require('../models/cocktailReviewModel')
const DiyRecipeReview = require('../models/diyRecipeReviewModel')
const Bar = require('../models/barModel');
const { NotFoundError } = require('../utils/customError');
const searchService = {
   async a() {
      await CocktailReview.find();
      await DiyRecipeReview.find();
      await Bar.find();
   },
   async searchByKeyword(keyword, type, sort, item, page) {
      let limit = item ? item : 10;
      let skip = page ? (page - 1) * limit : 0;
      // base 검색
      let base = await Base.find({ name: { $regex: keyword, $options: 'i' } }).select('_id').lean();
      let baseIds = base.map(base => base._id);
   
      let types = ['cocktail', 'diyRecipe'];
      if (type) types = [type];
   
      let results = {};
      // type별 검색
      for (let type of types) {
         let Model = type === 'cocktail' ? Cocktail : DiyRecipe;
         let items = await Model.find({
            $or: [
               { name: { $regex: keyword, $options: 'i' } },
               { base: { $in: baseIds } }
            ],
         }).populate('base').populate({ path: 'review', select: 'rating' }).skip(skip).limit(item).lean();
         if(types.length < 3 && !items.length) throw new NotFoundError("검색 결과가 없음")
         // 평균 별점& 리뷰 숫자 계산
         let itemResults = [];
         for (let item of items) {
            let avgRating = item.review.reduce((acc, review) => acc + review.rating, 0) / item.review.length;
            let reviewCount = item.review.length;
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
   }

};

module.exports = searchService;