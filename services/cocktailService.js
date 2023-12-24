const { default: mongoose } = require('mongoose');
const { Base, Cocktail, CocktailReview } = require('../models');
const { BadRequestError, NotFoundError, ConflictError, InternalServerError } = require('../utils/customError');
const setPrameter = require('../utils/setParameter');
const setParameter = require('../utils/setParameter');

const cocktailService = {
   //* 맞춤 추천 칵테일
   async getCustomCocktail(base, abv, taste, level) {
      let foundBase;
      if (!level || level < 1 || level > 5) throw new BadRequestError("level 값 오류");
      // base 미선택시 모든 베이스를 대상
      if (!base) {
         foundBase = await Base.find({}).select('_id').lean();
      } else {
         foundBase = await Base.find({ name: base }).select('_id').lean();
      }
      if (foundBase.length === 0) throw new BadRequestError("base 값 오류");
      // 도수 범위 설정
      let abvRange = {};
      switch (abv) {
         case 1:
            abvRange = { $gte: 1, $lt: 3 };
            break;
         case 2:
            abvRange = { $gte: 3, $lt: 4 };
            break;
         case 3:
            abvRange = { $gte: 4 };
            break;
         default:
            throw new BadRequestError('abv 값 오류');
      }
      // 맛 설정
      let tasteQuery = {};
      switch (taste) {
         case 'sweet':
            tasteQuery = { sweet: { $gt: level } };
            break;
         case 'sour':
            tasteQuery = { sour: { $gt: level } };
            break;
         case 'bitter':
            tasteQuery = { bitter: { $gt: level } };
            break;
         default:
            throw new BadRequestError('taste 값 오류');
      }

      const cocktails = await Cocktail.find({
         base: { $in: foundBase },
         abv: abvRange,
         ...tasteQuery
      }).sort({ 'reviews.length': -1 }).populate('reviews').populate('base').limit(3).lean();

      if (cocktails.length === 0) throw new NotFoundError('조건에 맞는 칵테일 없음');

      // 가장 인기있는 칵테일 선택
      const result = cocktails.map((item) => {
         const { reviews, wishes, ...rest } = item;
         const avgRating = (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(2);
         return {
            ...rest,
            base: rest.base.name,
            reviewCount: reviews.length,
            avgRating: avgRating,
         };
      });
      return result;
   },
   //*칵테일 목록 조회
   async getCocktailList(query) {
      const { cursorId, sort, cursorValue, page, perPage, abv, sweet, bitter, sour, base } = query;
      const { limit, skip } = setParameter(perPage, page);
      const cursorValues = Number(cursorValue);
      const dateFromId = cursorId ? new Date(parseInt(cursorId.substring(0, 8), 16) * 1000) : null;
      const ranges = {
         1: [1, 2],
         2: [3],
         3: [4, 5]
      };

      const option = {};
      if (abv) option.abv = { $in: ranges[abv] };
      if (sweet) option.sweet = { $in: ranges[sweet] };
      if (bitter) option.bitter = { $in: ranges[bitter] };
      if (sour) option.sour = { $in: ranges[sour] };

      let foundBase;
      if (!base) {
         foundBase = await Base.find({}).select('_id').lean();
      } else {
         foundBase = await Base.find({ name: base }).select('_id').lean();
      }
      if (foundBase.length === 0) throw new BadRequestError("base 값 오류");

      // base를 쿼리에 추가
      option.base = { $in: foundBase.map(b => b._id) };

      let sortObj = { createdAt: -1 };
      if (sort === 'rating') {
         sortObj = { avgRating: -1, ...sortObj };
      } else if (sort === 'review') {
         sortObj = { reviewCount: -1, ...sortObj };
      }
      const matchData = { $and: [option] };

      const addCursorCondition = (key, value) => {
         const condition1 = { [key]: { $lt: value } };
         const condition2 = { [key]: value };
         if (key !== 'createdAt') condition2.createdAt = { $lt: dateFromId };
         matchData.$and.push({ $or: [condition1, condition2,] });
      };

      if (cursorId && cursorValues) {
         matchData.$and.push({ _id: { $ne: new mongoose.Types.ObjectId(cursorId) } });
         if (sort === 'review') addCursorCondition('reviewCount', cursorValues);
         else if (sort === 'rating') addCursorCondition('avgRating', cursorValues);
         else addCursorCondition('createdAt', dateFromId);
      } else if (cursorId) {
         matchData.$and.push({ _id: { $ne: new mongoose.Types.ObjectId(cursorId) } });
         addCursorCondition('createdAt', dateFromId);
      }
      const pipelineCount = [
         { $match: option },
         { $sort: sortObj },
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

      const cocktails = await Cocktail.aggregate(pipelineData);
      const total = await Cocktail.aggregate(pipelineCount);
      
      let cocktailSize;
      if (total.length === 0) cocktailSize = 0;
      else cocktailSize = total[0].total;
      const results = { cocktailSize, cocktails, };
      return results;
   },
   //* 칵테일 상세 조회
   async getCocktail(id) {
      const cocktail = await Cocktail.findById(id).populate({ path: 'base', select: 'name' }).populate({ path: 'reviews', options: { limit: 2 } }).lean();
      if (!cocktail) throw new NotFoundError('칵테일 없음');
      cocktail.reviews = cocktail.reviews.map(review => ({
         ...review,
         likeCount: review.likes.length,
      }));
      return cocktail;
   },
   //* 칵테일 등록
   async createCocktail(data) {
      const { name, base, image, description, ingredient, tags, recipes, abv, sweet, bitter, sour } = data;
      const foundCocktail = await Cocktail.findOne({ name: name }).lean();
      if (foundCocktail) throw new ConflictError('이미 등록된 칵테일');

      const newCocktail = new Cocktail({ name, base, image, description, ingredient, tags, recipes, abv, sweet, bitter, sour });
      const result = await newCocktail.save();
      if (!result) throw new InternalServerError('등록 안됨');
   },
   //* 칵테일 수정
   async updateCocktail(id, data) {
      const { name, base, image, description, ingredient, tags, recipes, abv, sweet, bitter, sour } = data;
      const { payload, ...rest } = data;
      const foundCocktail = await Cocktail.findById(id).lean();
      if (!foundCocktail) throw new NotFoundError('칵테일 정보 없음');

      const dataKeys = Object.keys(rest);
      const isSame = dataKeys.map(key => foundCocktail[key] === data[key]).some(value => value === true);

      if (isSame) {
         throw new ConflictError('같은 내용 수정');
      }
      const updateCocktail = await Cocktail.updateOne(
         { _id: id },
         { name, base, image, description, ingredient, tags, recipes, abv, sweet, bitter, sour },
         { runValidators: true }
      );
      if (updateCocktail.modifiedCount === 0) throw new InternalServerError('칵테일 수정 실패');
   },
   //* 칵테일 삭제
   async deleteCocktail(id) {
      const cocktail = await Cocktail.findById(id).lean();
      if (!cocktail) throw new NotFoundError('칵테일 정보 없음');
      await CocktailReview.deleteMany({ cocktail: id });
      const result = await Cocktail.deleteOne({ _id: id });
      if (result.deletedCount === 0) throw new InternalServerError("칵테일 삭제 실패");
   },
};

module.exports = cocktailService;
