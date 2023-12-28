const { NotFoundError, ConflictError, InternalServerError, BadRequestError, ForbiddenError } = require('../utils/customError');
const { DiyRecipeReview, DiyRecipe, Base } = require('../models');
const { default: mongoose } = require('mongoose');
const setParameter = require('../utils/setParameter');
const fs = require('fs').promises;
const path = require('path');

const diyRecipeService = {
  //* DIY 레시피 목록 조회
  async getDiyRecipeList(user, query) {
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
    const diyRecipes = await DiyRecipe.aggregate(pipelineData);
    const total = await DiyRecipe.aggregate(pipelineCount);
    let userId = user ? user.id.toString() : '';
    let diyRecipeWishes = diyRecipes.map(diyRecipe => {
      const { wishes, ...rest } = diyRecipe;
      return {
        ...rest,
        isWished: Array.isArray(wishes) && wishes.map(wish => wish.toString()).includes(userId),
      };
    });
    let diyRecipeSize;
    if (total.length === 0) diyRecipeSize = 0;
    else diyRecipeSize = total[0].total;
    const results = { diyRecipeSize, diyRecipes: diyRecipeWishes, };
    return results;
  },
  //* DIY 레시피 상세 조회
  async getDiyRecipe(user, id) {
    const diyRecipe = await DiyRecipe.findById(id)
      .populate({ path: 'base', select: 'name' })
      .populate({ path: 'reviews', options: { limit: 2 }, populate: { path: 'user', select: 'nickname' } })
      .lean(); //id에 맞는 레시피 찾아 리뷰정보랑 같이 반환 limit은 2
    if (!diyRecipe) throw new NotFoundError('DIY 레시피 없습니다.');
    let userId = user ? user.id.toString() : '';
    diyRecipe.isWished = Array.isArray(diyRecipe.wishes) && diyRecipe.wishes.map(wish => wish.toString()).includes(userId);
    diyRecipe.reviews = diyRecipe.reviews.map((review) => ({
      ...review,
      nickname: review.user.nickname,
      isLiked: Array.isArray(review.likes) && review.likes.map(like => like.toString()).includes(userId),
      likeCount: review.likes.length || 0,
    }));
    return diyRecipe;
  },
  //* DIY 레시피 등록
  async createDiyRecipe(user, { name, base, newImageNames, recipeImageNames, description, ingredient, tags, content, abv, sweet, bitter, sour, }) {

    const foundDiyRecipe = await DiyRecipe.findOne({ name: name }).lean();
    if (foundDiyRecipe) throw new ConflictError('이미 등록된 DIY 레시피 입니다.');
    //이미지
    let image;
    if (newImageNames.length !== 0 && Array.isArray(newImageNames)) {
      image = newImageNames[0].imageName;
    }
    let recipes = [];
    if (recipeImageNames.length !== 0 && Array.isArray(recipeImageNames)) {
      for (let i = 0; i < content.length; i++) {
        let recipe = {};
        recipe.content = content[i];
        recipe.image = recipeImageNames[i].imageName;
        recipes.push(recipe);
      }
    } else {
      for (let i = 0; i < content.length; i++) {
        let recipe = {};
        recipe.content = content[i];
        recipes.push(recipe);
      }
    }
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
  async updateDiyRecipe(userId, id, newImageNames, recipeImageNames, data) {
    let { name, base, description, ingredient, tags, content, abv, sweet, bitter, sour, } = data;
    const foundDiyRecipe = await DiyRecipe.findOne({ _id: id, user: userId }).lean();
    if (!foundDiyRecipe) throw new ForbiddenError('사용자가 작성한 레시피가 아닙니다.');

    //이미지
    let image;
    if (newImageNames.length !== 0 && Array.isArray(newImageNames)) {
      const imagePath = path.join(__dirname, '../', foundDiyRecipe.image);
      await fs.unlink(imagePath).catch(err => {
        if (err.code !== 'ENOENT') {
          throw new InternalServerError('이미지 삭제 실패');
        }
      });
      image = newImageNames[0].imageName;
    }
    let recipes = [];

    let maxLength = Math.max(content.length, recipeImageNames ? recipeImageNames.length : 0);

    for (let i = 0; i < maxLength; i++) {
      let recipe = {};

      if (content[i]) {
        recipe.content = content[i];
      }

      if (recipeImageNames && recipeImageNames[i]) {
        if (foundDiyRecipe.recipes && foundDiyRecipe.recipes[i] && foundDiyRecipe.recipes[i].image) {
          const imagePath = path.join(__dirname, '../', foundDiyRecipe.recipes[i].image);
          await fs.unlink(imagePath).catch(err => {
            if (err.code !== 'ENOENT') {
              throw new InternalServerError('레시피 이미지 삭제 실패');
            }
          });
        }
        recipe.image = recipeImageNames[i].imageName;
      }

      recipes.push(recipe);
    }
    const dataKeys = Object.keys({ name, base, image, description, ingredient, tags, recipes, abv, sweet, bitter, sour, });
    const isSame = dataKeys
      .map((key) => foundDiyRecipe[key] === data[key])
      .every((value) => value === true);

    if (isSame) {
      throw new ConflictError('같은 내용 수정');
    }
    await DiyRecipe.updateOne(
      { _id: id },
      { name, base, image, description, ingredient, tags, recipes, abv, sweet, bitter, sour, },
      { runValidators: true }, //벨리데이터 추가!
    );
  },
  //* DIY 레시피 삭제
  async deleteDiyRecipe(user, id) {
    let diyRecipe;
    if (!user.isAdmin) {
      diyRecipe = await DiyRecipe.findOne({ _id: id, user: user._id }).lean();
      if (!diyRecipe) throw new ForbiddenError('작성자가 아닙니다.');
    }
    else diyRecipe = await DiyRecipe.findById(id).lean();

    if (!diyRecipe) throw new NotFoundError('DIY 레시피 정보 없습니다.');
    //이미지
    const imagePath = path.join(__dirname, '../', diyRecipe.image);
    await fs.unlink(imagePath).catch(err => {
      if (err.code !== 'ENOENT') {
        throw new InternalServerError('이미지 삭제 실패');
      }
    });

    for (let i = 0; i < diyRecipe.recipes.length; i++) {
      if (diyRecipe.recipes && diyRecipe.recipes[i] && diyRecipe.recipes[i].image) {
        const imagePath = path.join(__dirname, '../', diyRecipe.recipes[i].image);
        await fs.unlink(imagePath).catch(err => {
          if (err.code !== 'ENOENT') {
            throw new InternalServerError('레시피 이미지 삭제 실패');
          }
        });
      }
    }
    await DiyRecipeReview.deleteMany({ diyRecipe: id });
    const result = await DiyRecipe.deleteOne({ _id: id });
    if (result.deletedCount === 0)
      throw new InternalServerError('DIY 레시피 삭제를 실패했습니다.');
  },
  //* 사용자의 레시피 목록 조회
  async getDiyRecipeListByUser(userId, query) {
    const { cursorId, page, perPage } = query;
    const { skip, limit } = setParameter(perPage, page);
    const dateFromId = cursorId ? new Date(parseInt(cursorId.substring(0, 8), 16) * 1000) : null;

    const matchData = {
      $and: [
        { user: userId, _id: { $ne: new mongoose.Types.ObjectId(cursorId) } }
      ]
    };
    const countData = { $and: [{ user: userId, }] };

    const addCursorCondition = (key, value) => {
      const condition1 = { [key]: { $lt: value } };
      const condition2 = { [key]: value, createdAt: { $lt: dateFromId } };
      matchData.$and.push({ $or: [condition1, condition2] });
    };


    if (cursorId) {
      addCursorCondition('createdAt', dateFromId);
    }

    const pipelineData = [
      { $match: matchData },
      { $sort: { createdAt: -1 } },
      { $project: { _id: 1, name: 1, avgRating: 1, reviewCount: 1, createdAt: 1, image: 1 } },

    ];
    if (page) {
      pipelineData.push({ $skip: skip });
    }
    pipelineData.push({ $limit: limit });

    const runPipeline = async () => {
      const data = await DiyRecipe.aggregate(pipelineData);
      const size = await DiyRecipe.countDocuments(countData);
      return { size, data };
    };

    const results = {};
    const { size, data } = await runPipeline();
    results['diyRecipeSize'] = size;

    const groupedData = data.reduce((acc, review) => {
      const monthYear = `${review.createdAt.getFullYear()}-${review.createdAt.getMonth() + 1}`;
      if (!acc[monthYear]) {
        acc[monthYear] = { date: monthYear, list: [] };
      }
      acc[monthYear].list.push(review);
      return acc;
    }, {});

    results['diyRecipes'] = Object.values(groupedData);

    return results;
  }
};

module.exports = diyRecipeService;
