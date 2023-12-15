const Cocktail = require('../models/cocktailModel');
const Base = require('../models/baseModel');
const { BadRequestError, NotFoundError } = require('../utils/customError')

const cocktailService = {
   async customCocktail(base, abv, taste, level) {

      let levels = Number(level);
      let foundBase;
      if (!levels || levels < 1 || levels > 5) throw new BadRequestError("level 값 오류")
      // base 미선택시 모든 베이스를 대상
      if (!base) {
         foundBase = await Base.find({}).select('_id').lean();
      } else {
         foundBase = await Base.find({ name: base }).select('_id').lean();
      }
      if (foundBase.length === 0) throw new BadRequestError("base 값 오류")
      // 도수 범위 설정
      let abvRange = {};
      switch (abv) {
         case '1':
            abvRange = { $gte: 0, $lt: 10 };
            break;
         case '2':
            abvRange = { $gte: 10, $lt: 20 };
            break;
         case '3':
            abvRange = { $gte: 20 };
            break;
         default:
            throw new BadRequestError('abv 값 오류')
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
            throw new BadRequestError('taste 값 오류')
      }

      let cocktails = await Cocktail.find({
         base: { $in: foundBase },
         abv: abvRange,
         ...tasteQuery
      }).populate('review').sort({ 'review.length': -1 }).populate('base').limit(3).lean();
      if (cocktails.length === 0) throw new NotFoundError('조건에 맞는 칵테일 없음')
      // 가장 인기있는 칵테일 선택

      const result = cocktails.map((item) => {
         return {
            _id: item._id,
            name: item.name,
            base: item.base.name,
            image: item.image,
            abv: item.abv,
            sweet: item.sweet,
            bitter: item.bitter,
            sour: item.sour,
            reviewCount: item.review.length,
            wishCount: item.wish.length,
         }
      })
      return result;
   }
}

module.exports = cocktailService;