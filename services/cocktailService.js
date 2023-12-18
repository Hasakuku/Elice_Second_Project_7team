const Cocktail = require('../models/cocktailModel');
const Base = require('../models/baseModel');
const { BadRequestError, NotFoundError } = require('../utils/customError');

const cocktailService = {
   // 맞춤 추천 칵테일
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
            abvRange = { $gte: 0, $lt: 10 };
            break;
         case 2:
            abvRange = { $gte: 10, $lt: 20 };
            break;
         case 3:
            abvRange = { $gte: 20 };
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
      }).populate('reviews').sort({ 'reviews.length': -1 }).populate('base').limit(3).lean();

      if (cocktails.length === 0) throw new NotFoundError('조건에 맞는 칵테일 없음');

      // 가장 인기있는 칵테일 선택
      const result = cocktails.map((item) => {
         const { reviews, wish, ...rest } = item;
         return {
            ...rest,
            base: rest.base.name,
            reviewCount: reviews.length,
            wishCount: wish.length,
         };
      });
      return result;
   },
   // 칵테일 목록 조회
   async getCocktailList(base, sort, abv, sweet, bitter, sour, item, page) {
      let foundBase;
      let option = {};// find할 옵션
      //페이지당 아이템 수
      const limit = item === undefined || item === null ? 10 : item;
      const skip = page ? (page - 1) * limit : 0;

      // base 미선택시 모든 베이스를 대상
      if (!base) {
         foundBase = await Base.find({}).select('_id').lean();
      } else {
         foundBase = await Base.find({ name: base }).select('_id').lean();
      }
      if (foundBase.length === 0) throw new BadRequestError("base 값 오류");

      // base를 쿼리에 추가
      option.base = { $in: foundBase.map(b => b._id) };

      // abv, sweet, bitter, sour가 주어진 경우 옵션에 추가
      if (abv) {
         switch (abv) {
            case 1:
               option.abv = { $gte: 0, $lt: 10 };
               break;
            case 2:
               option.abv = { $gte: 10, $lt: 20 };
               break;
            case 3:
               option.abv = { $gte: 20 };
               break;
            default:
               throw new BadRequestError('abv 값 오류');
         }
      }
      if (sweet) {
         switch (sweet) {
            case 1:
               option.sweet = { $in: [1, 2] };
               break;
            case 2:
               option.sweet = { $eq: 3 };
               break;
            case 3:
               option.sweet = { $in: [4, 5] };
               break;
            default:
               throw new BadRequestError('sweet 값 오류');
         }
      }
      if (bitter) {
         switch (bitter) {
            case 1:
               option.bitter = { $in: [1, 2] };
               break;
            case 2:
               option.bitter = { $eq: 3 };
               break;
            case 3:
               option.bitter = { $in: [4, 5] };
               break;
            default:
               throw new BadRequestError('bitter 값 오류');
         }
      }
      if (sour) {
         switch (sour) {
            case 1:
               option.sour = { $in: [1, 2] };
               break;
            case 2:
               option.sour = { $eq: 3 };
               break;
            case 3:
               option.sour = { $in: [4, 5] };
               break;
            default:
               throw new BadRequestError('sour 값 오류');
         }
      }

      // 칵테일 조회
      const cocktails = await Cocktail.find(option)
         .skip(skip)
         .limit(limit)
         .select('_id name image createdAt updatedAt')
         .populate({
            path: 'reviews',
            select: 'rating -_id'
         })
         .lean();
      if (cocktails.length === 0) throw new NotFoundError('조건에 맞는 칵테일 없음');
      // 각 칵테일에 대한 평균 평점과 리뷰 수 계산
      for (let cocktail of cocktails) {
         let avgRating = cocktail.reviews.reduce((acc, reviews) => acc + reviews.rating, 0) / cocktail.reviews.length;
         cocktail.avgRating = avgRating;
         cocktail.reviewCount = cocktail.reviews.length;
      }

      // 정렬 적용
      let sortedCocktails;
      switch (sort) {
         case 'rating':
            sortedCocktails = cocktails.sort((a, b) => b.avgRating - a.avgRating);
            break;
         case 'review':
            sortedCocktails = cocktails.sort((a, b) => b.reviewCount - a.reviewCount);
            break;
         default:
            sortedCocktails = cocktails;
      }
      const result = sortedCocktails.map(item => {
         const { reviews, ...rest } = item;
         return {
            ...rest,
            avgRating: item.avgRating,
            reviewCount: item.reviewCount,
         };
      });
      return result;
   },
};

module.exports = cocktailService;