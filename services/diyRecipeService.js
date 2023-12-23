const { NotFoundError, ConflictError, InternalServerError, BadRequestError } = require('../utils/customError');
const { DiyRecipeReview, DiyRecipe, Base } = require('../models');
const { default: mongoose } = require('mongoose');

const diyRecipeService = {
  //* DIY 레시피 목록 조회
  async getDiyRecipeList(query) {
    const { cursorId, sort, cursorValue, perPage, abv, sweet, bitter, sour, base } = query;
    const cursorValues = Number(cursorValue);
    const perPages = Number(perPage);
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
      { $limit: perPages || 6 },
    ];

    const diyRecipes = await DiyRecipe.aggregate(pipelineData);
    const total = await DiyRecipe.aggregate(pipelineCount);
    let diyRecipeSize;
    if (total.length === 0) diyRecipeSize = 0;
    else diyRecipeSize = total[0].total;
    const results = { diyRecipeSize, diyRecipes, };
    return results;
  },
  //* DIY 레시피 상세 조회
  async getDiyRecipe(id) {
    const diyRecipe = await DiyRecipe.findById(id)
      .populate({ path: 'base', select: 'name' })
      .populate({ path: 'reviews', options: { limit: 2 } })
      .lean(); //id에 맞는 레시피 찾아 리뷰정보랑 같이 반환 limit은 2
    if (!diyRecipe) throw new NotFoundError('DIY 레시피 없습니다.');
    diyRecipe.reviews = diyRecipe.reviews.map((review) => ({
      ...review,
      likeCount: review.likes.length,
    }));
    return diyRecipe;
  },
  //* DIY 레시피 등록
  async createDiyRecipe(data, user) {
    const {
      name,
      base,
      image,
      description,
      ingredient,
      tags,
      recipes,
      abv,
      sweet,
      bitter,
      sour,
    } = data; //피드백 받았던대로 따로 가져옴
    const foundDiyRecipe = await DiyRecipe.findOne({ name: name }).lean();
    if (foundDiyRecipe)
      throw new ConflictError('이미 등록된 DIY 레시피 입니다.');

    const newDiyRecipe = new DiyRecipe({
      name,
      user,
      base,
      image,
      description,
      ingredient,
      tags,
      recipes,
      abv,
      sweet,
      bitter,
      sour,
    });
    const result = await newDiyRecipe.save();
    if (!result) throw new InternalServerError('등록 할 수 없습니다.');
  },
  //* DIY 레시피 수정
  async updateDiyRecipe(id, data) {
    const {
      name,
      base,
      image,
      description,
      ingredient,
      tags,
      recipes,
      abv,
      sweet,
      bitter,
      sour,
    } = data;
    const foundDiyRecipe = await DiyRecipe.findById(id).lean();
    if (!foundDiyRecipe) throw new NotFoundError('DIY 레시피 정보 X');
    const { payload, ...rest } = data;
    const dataKeys = Object.keys(rest);
    const isSame = dataKeys
      .map((key) => foundDiyRecipe[key] === data[key])
      .some((value) => value === true);

    if (isSame) {
      throw new ConflictError('같은 내용 수정');
    }
    const updateDiyRecipe = await DiyRecipe.updateOne(
      { _id: id },
      {
        name,
        base,
        image,
        description,
        ingredient,
        tags,
        recipes,
        abv,
        sweet,
        bitter,
        sour,
      },
      { runValidators: true }, //벨리데이터 추가!
    );
    if (updateDiyRecipe.modifiedCount === 0)
      throw new InternalServerError('DIY 레시피 수정을 실패했습니다.');
  },
  //* DIY 레시피 삭제
  async deleteDiyRecipe(id) {
    const diyRecipe = await DiyRecipe.findById(id).lean();
    if (!diyRecipe) throw new NotFoundError('DIY 레시피 정보 X');
    await DiyRecipeReview.deleteMany({ diyRecipe: id });
    const result = await DiyRecipe.deleteOne({ _id: id });
    if (result.deletedCount === 0)
      throw new InternalServerError('DIY 레시피 삭제를 실패했습니다.');
  },
  //* 사용자의 레시피 목록 조회
  async getDiyRecipeListByUser(userId) {
    const diyRecipes = await DiyRecipe.find({ user: userId }).lean();

  },
};

module.exports = diyRecipeService;
