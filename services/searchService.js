const { default: mongoose } = require('mongoose');
const { Base, Cocktail, DiyRecipe, CocktailReview } = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/customError');
const setParameter = require('../utils/setParameter');

const searchService = {
   async searchByKeyword(query) {
      const { keyword, cursorId, sort, cursorValue, perPage, type } = query;
      // base 검색
      const base = await Base.find({ name: { $regex: keyword, $options: 'i' } }).select('_id').lean();
      const baseIds = base.map(base => base._id);
      let cursorValues = Number(cursorValue);
      let perPages = Number(perPage);
      let dateFromId;

      if (cursorId) dateFromId = new Date(parseInt(cursorId.substring(0, 8), 16) * 1000);

      let sortObj = {};
      if (sort === 'rating') {
         sortObj.avgRating = -1;
         sortObj.createdAt = -1;
      } else if (sort === 'review') {
         sortObj.reviewCount = -1;
         sortObj.createdAt = -1;
      } else {
         sortObj.createdAt = -1;
      }

      let matchCount = {
         $or: [
            { name: { $regex: new RegExp(keyword, 'i') }, },
            { base: { $in: baseIds } }
         ]
      };
      let matchData = {
         $and: [
            {
               $or: [
                  { name: { $regex: new RegExp(keyword, 'i') }, _id: { $ne: new mongoose.Types.ObjectId(cursorId) } },
                  { base: { $in: baseIds } }
               ]
            },
            { $or: [] }
         ]
      };

      if (cursorId && cursorValues) {
         if (sort === 'review') {
            matchData.$and[1].$or.push(
               { 'reviewCount': { $lt: cursorValues } },
               { 'reviewCount': cursorValues, 'createdAt': { $lt: dateFromId } }
            );
         } else if (sort === 'rating') {
            matchData.$and[1].$or.push(
               { 'avgRating': { $lt: cursorValues } },
               { 'avgRating': cursorValues, 'createdAt': { $lt: dateFromId } }
            );
         } else {
            matchData.$and[1].$or.push(
               { 'createdAt': { $lt: dateFromId } }
            );
         }
      } else if (cursorId) {
         matchData.$and[1].$or.push(
            { 'createdAt': { $lt: dateFromId } }
         );
      }

      if (matchData.$and[1].$or.length === 0) {
         matchData.$and.pop();
      }


      const pipelineCount = [
         { $match: matchCount },
         { $count: 'total' }
      ];

      const pipelineData = [
         { $match: matchData },
         { $sort: sortObj },
         { $project: { _id: 1, name: 1, avgRating: 1, reviewCount: 1, createdAt: 1 } },
         { $limit: perPages || 6 },
      ];

      let total, cocktailSize, diyRecipeSize;

      if (type === 'cocktails') {
         total = await Cocktail.aggregate(pipelineCount);
         if (total.length === 0) total.push({ total: 0 });
         cocktailSize = total[0].total;
         

      } else if (type === 'recipes') {
         total = await DiyRecipe.aggregate(pipelineCount);
         if (total.length === 0) total.push({ total: 0 });
         diyRecipeSize = total[0].total;
      } else {
         const totalCocktails = await Cocktail.aggregate(pipelineCount);
         const totalDiyRecipes = await DiyRecipe.aggregate(pipelineCount);
         if (totalCocktails.length === 0) totalCocktails.push({ total: 0 });
         if (totalDiyRecipes.length === 0) totalDiyRecipes.push({ total: 0 });
         cocktailSize = totalCocktails[0].total;
         diyRecipeSize = totalDiyRecipes[0].total;
         total = totalCocktails[0].total + totalDiyRecipes[0].total;
      }


      if (type === 'cocktails') {
         const cocktails = await Cocktail.aggregate(pipelineData);
         return { cocktailSize, cocktails };
      } else if (type === 'recipes') {
         const diyRecipes = await DiyRecipe.aggregate(pipelineData);
         return { diyRecipeSize, diyRecipes };
      } else {
         const cocktails = await Cocktail.aggregate(pipelineData);
         const diyRecipes = await DiyRecipe.aggregate(pipelineData);
         return { total, cocktailSize, diyRecipeSize, cocktails, diyRecipes };
      }
   },
   // async searchByKeyword(keyword, type, sort, item, page) {
   //    const { limit, skip,} = setParameter(item, page);
   //    const types = (type === 'cocktails' ? ['cocktails']
   //    : type === 'recipes' ? ['diyRecipes']
   //       : type === undefined || type === null ? ['cocktails', 'diyRecipes']
   //          : (() => { throw new BadRequestError('타입 오류'); })());
   //    // base 검색
   //    const base = await Base.find({ name: { $regex: keyword, $options: 'i' } }).select('_id').lean();
   //    const baseIds = base.map(base => base._id);

   //    let results = {};
   //    // type별 검색
   //    for (let type of types) {
   //       const Model = type === 'cocktails' ? Cocktail : DiyRecipe;
   //       const items = await Model.find({
   //          $or: [
   //             { name: { $regex: keyword, $options: 'i' } },
   //             { base: { $in: baseIds } }
   //          ],
   //       }).populate('base').populate({ path: 'reviews', select: 'rating' }).skip(skip).limit(limit).lean();
   //       if (types.length < 3 && !items.length === 0) throw new NotFoundError("검색 결과가 없음");
   //       // 평균 별점& 리뷰 숫자 계산.
   //       let itemResults = [];
   //       for (let item of items) {
   //          const avgRating = (item.reviews.reduce((acc, reviews) => acc + reviews.rating, 0) / item.reviews.length).toFixed(2);
   //          const reviewCount = item.reviews.length;
   //          itemResults.push({
   //             _id: item._id,
   //             name: item.name,
   //             image: item.image,
   //             avgRating,
   //             reviewCount
   //          });
   //       }

   //       // 정렬 적용
   //       let sortedItems;
   //       switch (sort) {
   //          case 'rating':
   //             sortedItems = itemResults.sort((a, b) => b.avgRating - a.avgRating);
   //             break;
   //          case 'review':
   //             sortedItems = itemResults.sort((a, b) => b.reviewCount - a.reviewCount);
   //             break;
   //          default:
   //             sortedItems = itemResults;
   //       }
   //       results[type] = sortedItems;
   //    }

   //    return results;
   // },
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
      if (!total) throw new NotFoundError('검색 결과 없음');
      return totalCounts;
   }
};

module.exports = searchService;