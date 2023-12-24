const DiyRecipe = require('../models/diyRecipeModel');
const { NotFoundError, ConflictError, InternalServerError } = require('../utils/customError');
const DiyRecipeReview = require('../models/diyRecipeModel');

const diyRecipeService = {
  //* DIY 레시피 조회
  // MongoDB 에서 레시피 조회 -> option은 조회할 데이터의 조건,
  // skip은 건너뛸 데이터의 수, limit은 조회할 데이터의 수, sort는 정렬 방식
  async getDiyRecipeList(option, skip, limit, sort) {
    const diyRecipes = await DiyRecipe.find(option) //option 조건에 해당하는 모든 레시피 데이터 찾기
      .skip(skip) //skip 만큼 데이터를 건너뛰고
      .limit(limit) //limit만큼 데이터만 조회 - 리뷰에서 2개까지인것으로 기억하고 정함.
      .select('_id name image createdAt updatedAt') //모델에 타임스탬프를 통해서 필드에 추가된 createdAt updatedAt까지 선택
      .populate({
        path: 'reviews',
        select: 'rating -_id',
      })
      .lean();

    if (diyRecipes.length === 0)
      throw new NotFoundError('조건에 맞는 DIY 레시피 X');

    for (let diyRecipe of diyRecipes) {
      let avgRating =
        diyRecipe.reviews.reduce((acc, review) => acc + review.rating, 0) /
        diyRecipe.reviews.length; //reduce 함수를 이용해 모든 리뷰 평점 합 / 리뷰의 총수 = 평균
      diyRecipe.avgRating = avgRating.toFixed(2); // 그리고 toFixed(2)를 이용해 소수점 2번째 자릿수까지 반올림
      diyRecipe.reviewCount = diyRecipe.reviews.length;
    } //리뷰 평점과 리뷰 수 계산

    //레시피 정렬하기 인데.. 혹시 몰라서 일단 코드로 구현
    let sortedDiyRecipes;
    switch (sort) {
      case 'rating':
        sortedDiyRecipes = diyRecipes.sort((a, b) => b.avgRating - a.avgRating);
        break;
      case 'review':
        sortedDiyRecipes = diyRecipes.sort(
          (a, b) => b.reviewCount - a.reviewCount,
        );
        break;
      default:
        sortedDiyRecipes = diyRecipes;
    }

    //정렬된 레시피 목록들 반환
    const result = sortedDiyRecipes.map((item) => {
      const { reviews, ...rest } = item;
      return {
        ...rest,
        avgRating: item.avgRating,
        reviewCount: item.reviewCount,
      };
    });
    return result;
  },
  //* DIY 레시피 상세 조회
  async getDiyRecipe(id) {
    const diyRecipe = await DiyRecipe.findById(id)
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

    const {payload , ...rest} = data
    const dataKeys = Object.keys(rest);
    const isSame = dataKeys.map(key => foundCocktail[key] === data[key]).every(value => value === true);

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
};

module.exports = diyRecipeService;
