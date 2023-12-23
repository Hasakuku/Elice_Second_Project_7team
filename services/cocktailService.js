const { default: mongoose } = require('mongoose');
const { Base, Cocktail, CocktailReview } = require('../models');
const { BadRequestError, NotFoundError, ConflictError, InternalServerError } = require('../utils/customError');
const setPrameter = require('../utils/setParameter');

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
   //* 칵테일 목록 조회
   // async getCocktailList(base, sort, abv, sweet, bitter, sour, item, page) {
   //    let foundBase;
   //    let option = {};// find할 옵션
   //    const { limit, skip } = setPrameter(item, page);

   //    // base 미선택시 모든 베이스를 대상
   //    if (!base) {
   //       foundBase = await Base.find({}).select('_id').lean();
   //    } else {
   //       foundBase = await Base.find({ name: base }).select('_id').lean();
   //    }
   //    if (foundBase.length === 0) throw new BadRequestError("base 값 오류");

   //    // base를 쿼리에 추가
   //    option.base = { $in: foundBase.map(b => b._id) };

   //    // abv, sweet, bitter, sour가 주어진 경우 옵션에 추가
   //    if (abv) {
   //       switch (abv) {
   //          case 1:
   //             option.abv = { $gte: 0, $lt: 10 };
   //             break;
   //          case 2:
   //             option.abv = { $gte: 10, $lt: 20 };
   //             break;
   //          case 3:
   //             option.abv = { $gte: 20 };
   //             break;
   //          default:
   //             throw new BadRequestError('abv 값 오류');
   //       }
   //    }
   //    if (sweet) {
   //       switch (sweet) {
   //          case 1:
   //             option.sweet = { $in: [1, 2] };
   //             break;
   //          case 2:
   //             option.sweet = { $eq: 3 };
   //             break;
   //          case 3:
   //             option.sweet = { $in: [4, 5] };
   //             break;
   //          default:
   //             throw new BadRequestError('sweet 값 오류');
   //       }
   //    }
   //    if (bitter) {
   //       switch (bitter) {
   //          case 1:
   //             option.bitter = { $in: [1, 2] };
   //             break;
   //          case 2:
   //             option.bitter = { $eq: 3 };
   //             break;
   //          case 3:
   //             option.bitter = { $in: [4, 5] };
   //             break;
   //          default:
   //             throw new BadRequestError('bitter 값 오류');
   //       }
   //    }
   //    if (sour) {
   //       switch (sour) {
   //          case 1:
   //             option.sour = { $in: [1, 2] };
   //             break;
   //          case 2:
   //             option.sour = { $eq: 3 };
   //             break;
   //          case 3:
   //             option.sour = { $in: [4, 5] };
   //             break;
   //          default:
   //             throw new BadRequestError('sour 값 오류');
   //       }
   //    }

   //    // 칵테일 조회
   //    const cocktails = await Cocktail.find(option)
   //       .skip(skip)
   //       .limit(limit)
   //       .select('_id name image createdAt updatedAt')
   //       .populate({
   //          path: 'reviews',
   //          select: 'rating -_id'
   //       })
   //       .lean();
   //    if (cocktails.length === 0) throw new NotFoundError('조건에 맞는 칵테일 없음');
   //    // 각 칵테일에 대한 평균 평점과 리뷰 수 계산
   //    for (let cocktail of cocktails) {
   //       let avgRating = cocktail.reviews.reduce((acc, review) => acc + review.rating, 0) / cocktail.reviews.length;
   //       cocktail.avgRating = avgRating.toFixed(2);
   //       cocktail.reviewCount = cocktail.reviews.length;
   //    }

   //    // 정렬 적용
   //    let sortedCocktails;
   //    switch (sort) {
   //       case 'rating':
   //          sortedCocktails = cocktails.sort((a, b) => b.avgRating - a.avgRating);
   //          break;
   //       case 'review':
   //          sortedCocktails = cocktails.sort((a, b) => b.reviewCount - a.reviewCount);
   //          break;
   //       default:
   //          sortedCocktails = cocktails;
   //    }
   //    const result = sortedCocktails.map(item => {
   //       const { reviews, ...rest } = item;
   //       return {
   //          ...rest,
   //          avgRating: item.avgRating,
   //          reviewCount: item.reviewCount,
   //       };
   //    });
   //    return result;
   // },
   async getCocktailList(query) {
      const { base, sort, abv, sweet, bitter, sour, cursorId, cursorValue, perPage } = query;
      let foundBase;
      let option = {}; // find할 옵션
      let cursorValues = Number(cursorValue);
      let perPages = Number(perPage);
      let dateFromId;
      let mongoId;

      if (cursorId) {
         dateFromId = new Date(parseInt(cursorId.substring(0, 8), 16) * 1000);
         mongoId = new mongoose.Types.ObjectId(cursorId);
      }

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
            case '1':
               option.abv = { $gte: 0, $lt: 10 };
               break;
            case '2':
               option.abv = { $gte: 10, $lt: 20 };
               break;
            case '3':
               option.abv = { $gte: 20 };
               break;
            default:
               throw new BadRequestError('abv 값 오류');
         }
      }
      if (sweet) {
         switch (sweet) {
            case '1':
               option.sweet = { $in: [1, 2] };
               break;
            case '2':
               option.sweet = { $eq: 3 };
               break;
            case '3':
               option.sweet = { $in: [4, 5] };
               break;
            default:
               throw new BadRequestError('sweet 값 오류');
         }
      }

      if (bitter) {
         switch (bitter) {
            case '1':
               option.bitter = { $in: [1, 2] };
               break;
            case '2':
               option.bitter = { $eq: 3 };
               break;
            case '3':
               option.bitter = { $in: [4, 5] };
               break;
            default:
               throw new BadRequestError('bitter 값 오류');
         }
      }
      if (sour) {
         switch (sour) {
            case '1':
               option.sour = { $in: [1, 2] };
               break;
            case '2':
               option.sour = { $eq: 3 };
               break;
            case '3':
               option.sour = { $in: [4, 5] };
               break;
            default:
               throw new BadRequestError('sour 값 오류');
         }
      }

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

      let match = {
         $or: [
            { name: { $regex: new RegExp(base, 'i') }, _id: { $ne: mongoId } },
            { base: { $in: foundBase.map(b => b._id) } }
         ]
      };
      if (cursorId && cursorValues) {
         if (sort === 'review') {
            match['$or'] = [
               { 'reviewCount': { $lt: cursorValues } },
               { 'reviewCount': cursorValues, 'createdAt': { $lt: dateFromId } },
            ];
         } else if (sort === 'rating') {
            match['$or'] = [
               { 'avgRating': { $lt: cursorValues } },
               { 'avgRating': cursorValues, 'createdAt': { $lt: dateFromId } },
            ];
         } else {
            match['$or'] = [
               { 'createdAt': { $lt: dateFromId } },
            ];
         }
      } else if (cursorId) {
         match['$or'] = [
            { 'createdAt': { $lt: dateFromId } },
         ];
      }
      let pipelineCount = [
         { $match: match },
         { $count: 'total' }
      ];
      let pipelineData = [
         { $match: match },
         { $sort: sortObj },
         { $project: { _id: 1, name: 1, avgRating: 1, reviewCount: 1, createdAt: 1, image: 1, } },
         { $limit: perPages || 6 },
      ];
      let total;
      total = await Cocktail.aggregate(pipelineCount);
      const cocktails = await Cocktail.aggregate(pipelineData);

      return { total: total[0].total, cocktails };
   },
   //* 칵테일 상세 조회
   async getCocktail(id) {
      const cocktail = await Cocktail.findById(id).populate({ path: 'reviews', options: { limit: 2 } }).lean();
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
      const {payload, ...rest} = data;
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
