const { default: mongoose } = require('mongoose');
const { Base, Cocktail, DiyRecipe, CocktailReview } = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/customError');
const setParameter = require('../utils/setParameter');

const searchService = {
   async searchByKeyword(keyword, type, sort, cursorId, cursorValues, perPages) {
      // const { keyword, cursorId, sort, cursorValue, perPage, type } = query;
      let cursorValue = Number(cursorValues);
      let perPage = Number(perPages);
      let match = {};
      // if (keyword) {
      //    match.name = { $regex: new RegExp(keyword, 'i') };
      // }

      let sortObj = {};
      if (sort === 'rating') {
         sortObj.avgRating = -1;
         // sortObj.cursorId = -1;
      } else if (sort === 'review') {
         sortObj.reviewCount = -1;
         sortObj.cursorId = -1;

      } else {
         sortObj.createdAt = 1; // default sort
      }

      if (cursorId && cursorValue) {
         // match._id = sort === 'default' ? { $lt: new mongoose.Types.ObjectId(cursorId) } : { $gt: new mongoose.Types.ObjectId(cursorId) };
         if (sort === 'review') {
            match['$or'] = [
               { 'reviewCount': { $lt: cursorValue } },
               { 'reviewCount': cursorValue, '_id': { $lt: cursorId } }
            ];
         } else if (sort === 'rating') {
            match['avgRating'] = { $lt: cursorValue };
         }
      }
      console.log(sortObj , match)
      let pipeline = [
         { $match: { name: { $regex: new RegExp(keyword, 'i') } } },
         { $lookup: { from: 'cocktailreviews', localField: 'reviews', foreignField: '_id', as: 'reviews' } },
         { $addFields: { reviewCount: { $size: '$reviews' }, avgRating: { $avg: '$reviews.rating' } } },
         { $sort: sortObj },
         { $match: match },
         { $limit: perPage || 6 },
         { $project: { _id: 1, name: 1, avgRating: 1, reviewCount: 1, createdAt: 1 } },
         
      ];

      if (type === 'cocktails') {
         const result = await Cocktail.aggregate(pipeline);
         return result;
      } else if (type === 'recipe') {
         return await DiyRecipe.aggregate(pipeline);
      } else {
         const cocktails = await Cocktail.aggregate(pipeline);
         const recipes = await DiyRecipe.aggregate(pipeline);
         return cocktails.concat(recipes);
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