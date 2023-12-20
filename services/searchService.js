const Cocktail = require('../models/cocktailModel');
const DiyRecipe = require('../models/diyRecipeModel');
const Base = require('../models/baseModel');
const { NotFoundError, BadRequestError } = require('../utils/customError');
const setParameter = require('../utils/setParameter');

const searchService = {
   async searchByKeyword(keyword, type, sort, item, page) {
      const { limit, skip, types } = setParameter(item, page, type);
      // base 검색
      const base = await Base.find({ name: { $regex: keyword, $options: 'i' } }).select('_id').lean();
      const baseIds = base.map(base => base._id);

      let results = {};
      // type별 검색
      for (let type of types) {
         const Model = type === 'cocktail' ? Cocktail : DiyRecipe;
         const items = await Model.find({
            $or: [
               { name: { $regex: keyword, $options: 'i' } },
               { base: { $in: baseIds } }
            ],
         }).populate('base').populate({ path: 'reviews', select: 'rating' }).skip(skip).limit(limit).lean();
         if (types.length < 3 && !items.length === 0) throw new NotFoundError("검색 결과가 없음");
         // 평균 별점& 리뷰 숫자 계산.
         let itemResults = [];
         for (let item of items) {
            const avgRating = (item.reviews.reduce((acc, reviews) => acc + reviews.rating, 0) / item.reviews.length).toFixed(2);
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
   async countByKeyword(keyword) {
      // base 검색
      const base = await Base.find({ name: { $regex: keyword, $options: 'i' } }).select('_id').lean();
      const baseIds = base.map(base => base._id);

      const types = ['cocktail', 'diyRecipe'];

      let totalCounts = {};
      let total = 0;
      // type별 검색
      for (let type of types) {
         const Model = type === 'cocktail' ? Cocktail : DiyRecipe;
         // 검색 결과 갯수 계산
         const totalCount = await Model.countDocuments({
            $or: [
               { name: { $regex: keyword, $options: 'i' } },
               { base: { $in: baseIds } }
            ],
         });
         totalCounts[type] = totalCount;
         total += totalCount;
      }
      totalCounts['total'] = total;
      if(!total) throw new NotFoundError('검색 결과 없음');
      return totalCounts;
   }
};

module.exports = searchService;