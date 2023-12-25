const asyncHandler = require('express-async-handler');
const diyRecipeService = require('../services/diyRecipeService');

// DIY 레시피 목록 조회
const getDiyRecipeList = asyncHandler(async (req, res) => {
  const { cursorId, sort, cursorValue, page, perPage, abv, sweet, bitter, sour, base } = req.query;
  const result = await diyRecipeService.getDiyRecipeList({ cursorId, sort, cursorValue, page, perPage, abv, sweet, bitter, sour, base });
  res.status(200).json(result);
});

// DIY 레시피 상세 조회
const getDiyRecipe = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const result = await diyRecipeService.getDiyRecipe(id);
  res.status(200).json(result);
});

// DIY 레시피 등록
const createDiyRecipe = asyncHandler(async (req, res) => {
  //유저 정보 
  const userId = req.user._id;
  const data = req.body;
  await diyRecipeService.createDiyRecipe(data, userId);
  res.status(201).json({ message: '레시피 등록이 완료되었습니다!' });
});

// DIY 레시피 수정
const updateDiyRecipe = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const data = req.body; -
    await diyRecipeService.updateDiyRecipe(id, data);
  res.status(200).json({ message: '레시피 수정이 완료되었습니다!' });
});

// DIY 레시피 삭제
const deleteDiyRecipe = asyncHandler(async (req, res) => {
  const id = req.params.id;
  await diyRecipeService.deleteDiyRecipe(id);
  res.status(204).json({ message: '레시피 삭제가 완료되었습니다!' });
});

//* 사용자의 레시피 목록 조회
const getDiyRecipeListByUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page, perPage, cursorId, cursorValue } = req.query;
  const result = await diyRecipeService.getDiyRecipeListByUser(userId, { page, perPage, cursorId, cursorValue });
  res.status(200).json(result);
});

module.exports = {
  getDiyRecipeList,
  getDiyRecipe,
  createDiyRecipe,
  updateDiyRecipe,
  deleteDiyRecipe,
  getDiyRecipeListByUser,
};
