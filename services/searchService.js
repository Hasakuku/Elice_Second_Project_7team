const { default: mongoose } = require('mongoose');
const { Base, Cocktail, DiyRecipe, CocktailReview } = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/customError');
const setParameter = require('../utils/setParameter');

const searchService = {
   async searchByKeyword(query) {
      const { keyword, cursorId, sort, cursorValue, page, perPage, type } = query;
      const { skip, limit } = setParameter(perPage, page);
      const base = await Base.find({ name: { $regex: keyword, $options: 'i' } }).select('_id').lean();
      const baseIds = base.map(base => base._id);
      const cursorValues = Number(cursorValue);
      const perPages = Number(perPage);
      const dateFromId = cursorId ? new Date(parseInt(cursorId.substring(0, 8), 16) * 1000) : null;

      let sortObj = { createdAt: -1 };
      if (sort === 'rating') {
         sortObj = { avgRating: -1, ...sortObj };
      } else if (sort === 'review') {
         sortObj = { reviewCount: -1, ...sortObj };
      }
      const matchCount = {
         $or: [
            { name: { $regex: new RegExp(keyword, 'i') }, },
            { base: { $in: baseIds } }
         ]
      };

      const matchData = {
         $and: [
            {
               $or: [
                  { name: { $regex: new RegExp(keyword, 'i') }, _id: { $ne: new mongoose.Types.ObjectId(cursorId) } },
                  { base: { $in: baseIds } }
               ]
            }
         ]
      };

      const addCursorCondition = (key, value) => {
         const condition1 = { [key]: { $lt: value } };
         const condition2 = { [key]: value };
         if (key !== 'createdAt') condition2.createdAt = { $lt: dateFromId };
         matchData.$and.push({ $or: [condition1, condition2] });
      };

      if (cursorId && cursorValues) {
         if (sort === 'review') addCursorCondition('reviewCount', cursorValues);
         else if (sort === 'rating') addCursorCondition('avgRating', cursorValues);
         else addCursorCondition('createdAt', dateFromId);
      } else if (cursorId) {
         addCursorCondition('createdAt', dateFromId);
      }

      const pipelineCount = [
         { $match: matchCount },
         { $count: 'total' }
      ];

      const pipelineData = [
         { $match: matchData },
         { $sort: sortObj },
         { $project: { _id: 1, name: 1, avgRating: 1, reviewCount: 1, createdAt: 1, image: 1 } },

      ];

      if (page) {
         pipelineData.push({ $skip: skip });
      }
      pipelineData.push({ $limit: limit });

      const runPipeline = async (Model) => {
         const total = await Model.aggregate(pipelineCount);
         const size = total.length > 0 ? total[0].total : 0;
         const data = await Model.aggregate(pipelineData);
         return { size, data };
      };

      const types = ['cocktail', 'diyRecipe'];
      const results = {};

      for (let item of types) {
         let Model;
         if (type === 'recipes' && item === 'diyRecipe') {
            Model = DiyRecipe;
         } else if (type !== 'recipes' && item === 'cocktail') {
            Model = Cocktail;
         } else if (!type || type === `${item}s`) {
            Model = item === 'cocktail' ? Cocktail : DiyRecipe;
         }

         if (Model) {
            const { size, data } = await runPipeline(Model);
            results[`${item}Size`] = size;
            results[`${item}s`] = data;
         }
      }
      if (!type) results.total = results.cocktailSize + results.diyRecipeSize;
      return results;
   },
};

module.exports = searchService;
