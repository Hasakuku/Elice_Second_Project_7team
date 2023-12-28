const { default: mongoose } = require('mongoose');
const { Base, Cocktail, DiyRecipe, User } = require('../models');
const setParameter = require('../utils/setParameter');

const searchService = {
   async searchByKeyword(user, { keyword, cursorId, sort, cursorValue, page, perPage, type }) {
      const { skip, limit } = setParameter(perPage, page);
      const base = await Base.find({ name: { $regex: keyword, $options: 'i' } }).select('_id').lean();
      const baseIds = base.map(base => base._id);
      const cursorValues = Number(cursorValue);
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
         { $project: { _id: 1, name: 1, avgRating: 1, reviewCount: 1, createdAt: 1, image: 1, wishes: 1 } },

      ];

      if (page) {
         pipelineData.push({ $skip: skip });
      }
      pipelineData.push({ $limit: limit });

      const runPipeline = async (Model) => {
         const total = await Model.aggregate(pipelineCount);
         const size = total.length > 0 ? total[0].total : 0;
         let data = await Model.aggregate(pipelineData);

         let userId = user ? user.id.toString() : '';
         data = data.map(item => {
            const { wishes, ...rest } = item;
            return {
               ...rest,
               isWished: Array.isArray(wishes) && wishes.map(wish => wish.toString()).includes(userId),
            };
         });
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
   async searchForAdmin({ keyword, perPage, page, type }) {
      const { skip, limit } = setParameter(perPage, page);
      let users = [];
      let base = [];
      if (keyword) {
         base = await Base.find({ name: { $regex: keyword, $options: 'i' } }).select('_id').lean();
         if (type === 'recipes') {
            users = await User.find({ email: { $regex: keyword, $options: 'i' } }).select('_id').lean();
         }
      } else base = await Base.find({}).select('_id').lean();
      const userIds = users.map(user => user._id);
      const baseIds = base.map(base => base._id);

      let sortObj = { createdAt: -1 };
      const matchObj = {
         $or: [
            { base: { $in: baseIds } },
         ]
      };
      if (keyword) matchObj.$or.unshift({ name: { $regex: new RegExp(keyword, 'i') } });
      if (users.length !== 0) matchObj.$or.push({ user: { $in: userIds } });

      const pipelineCount = [
         { $match: matchObj },
         { $count: 'total' }
      ];

      const pipelineData = [
         { $match: matchObj },
         { $sort: sortObj },
      ];

      if (type === 'recipes') {
         pipelineData.push(
            {
               $lookup: {
                  from: "users",
                  localField: "user",
                  foreignField: "_id",
                  as: "user"
               }
            },
            { $unwind: "$user" },
            { $project: { _id: 1, name: 1, createdAt: 1, email: '$user.email' } }
         );
      } else {
         pipelineData.push(
            { $project: { _id: 1, name: 1, createdAt: 1, } }
         );
      }

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
      return results;
   },
   async keywordAutoCompletion({ keyword, page, perPage }) {
      const { skip, limit } = setParameter(perPage, page);
      const base = await Base.find({ name: { $regex: keyword, $options: 'i' } }).select('_id').lean();
      const baseIds = base.map(base => base._id);

      const matchData = {
         $or: [
            { name: { $regex: new RegExp(keyword, 'i') } },
            { base: { $in: baseIds } }
         ]
      };

      const pipelineData = [
         { $match: matchData },
         { $sort: { name: 1 } },
         { $project: { name: 1 } }
      ];

      const runPipeline = async (Model) => {
         let data = await Model.aggregate(pipelineData);
         return data.map(item => item.name);
      };

      const types = ['cocktail', 'diyRecipe'];
      let results = [];

      for (let item of types) {
         let Model;
         if (item === 'cocktail') {
            Model = Cocktail;
         } else if (item === 'diyRecipe') {
            Model = DiyRecipe;
         }

         if (Model) {
            const modelResults = await runPipeline(Model);
            results.push(...modelResults);
         }
      }
      results.sort((a, b) => {
         const aStartsByKeyword = a.startsWith(keyword);
         const bStartsByKeyword = b.startsWith(keyword);

         if (aStartsByKeyword && !bStartsByKeyword) return -1;
         else if (!aStartsByKeyword && bStartsByKeyword) return 1;
         else return a.length - b.length;
      });
      if (page) results = results.slice(skip);
      results = results.slice(0, limit);

      return results;
   }
};

module.exports = searchService;
