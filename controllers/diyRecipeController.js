const asyncHandler = require('express-async-handler');
const diyRecipeService = require('../services/diyRecipeService');
const verifyUserToken = require('../utils/verifyUserToken');

//* DIY 레시피 목록 조회
const getDiyRecipeList = asyncHandler(async (req, res) => {
  const user = verifyUserToken(req);
  const { cursorId, sort, cursorValue, page, perPage, abv, sweet, bitter, sour, base } = req.query;
  const result = await diyRecipeService.getDiyRecipeList(user, { cursorId, sort, cursorValue, page, perPage, abv, sweet, bitter, sour, base });
  res.status(200).json(result);
});

//* DIY 레시피 상세 조회
const getDiyRecipe = asyncHandler(async (req, res) => {
  const user = verifyUserToken(req);
  const id = req.params.id;
  const result = await diyRecipeService.getDiyRecipe(user, id);
  res.status(200).json(result);
});

//* DIY 레시피 등록
const createDiyRecipe = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { name, base, newImageNames, recipeImageNames, description, ingredient, tags, content, abv, sweet, bitter, sour, } = req.body;
  await diyRecipeService.createDiyRecipe(userId,{ name, base, newImageNames, recipeImageNames, description, ingredient, tags, content, abv, sweet, bitter, sour, },);
  res.status(201).json({ message: '레시피 등록이 완료되었습니다!' });
});

//* DIY 레시피 수정
const updateDiyRecipe = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const id = req.params.id;
  const { newImageNames, recipeImageNames, ...rest } = req.body;
  const { name, base, description, ingredient, tags, content, abv, sweet, bitter, sour, } = rest;
  await diyRecipeService.updateDiyRecipe(userId, id, newImageNames, recipeImageNames, { name, base, description, ingredient, tags, content, abv, sweet, bitter, sour, });
  res.status(200).json({ message: '레시피 수정이 완료되었습니다!' });
});

//* DIY 레시피 삭제
const deleteDiyRecipe = asyncHandler(async (req, res) => {
  const user = req.user;
  const id = req.params.id;
  await diyRecipeService.deleteDiyRecipe(user, id);
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
