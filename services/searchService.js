const Cocktail = require('../models/cocktailModel');
const DiyRecipe = require('../models/diyRecipeModel');
const Base = require('../models/baseModel')

const searchService = {
   async searchByKeyword(keyword, type, sort, item, page) {
      // 건너뛸 항목 수 계산
      let skipItems = (page - 1) * item;
   
      // base 검색
      let base = await Base.find({ name: { $regex: keyword, $options: 'i' } }).select('_id');
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
         }).populate('base').populate({ path: 'review', select: 'rating' }).skip(skipItems).limit(item);
   
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