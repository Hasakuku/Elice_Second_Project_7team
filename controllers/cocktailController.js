const asyncHandler = require('express-async-handler');
const cocktailService = require('../services/cocktailService');
const { NotFoundError, UnauthorizedError } = require('../utils/customError');
const verifyUserToken = require('../utils/verifyUserToken');

//* 맞춤 추천 칵테일
const getCustomCocktail = asyncHandler(async (req, res) => {
  const user = req.user;
  const result = await cocktailService.getCustomCocktail(user);
  res.status(200).json(result);
});

//* 칵테일 목록 조회
const getCocktailList = asyncHandler(async (req, res) => {
  const user = verifyUserToken(req);
  const { cursorId, sort, cursorValue, page, perPage, abv, sweet, bitter, sour, base } = req.query;
  const result = await cocktailService.getCocktailList(user, { cursorId, sort, cursorValue, page, perPage, abv, sweet, bitter, sour, base });
  res.status(200).json(result);
});
//* 칵테일 상세 조회
const getCocktail = asyncHandler(async (req, res) => {
  const user = verifyUserToken(req);
  const id = req.params.id;
  const result = await cocktailService.getCocktail(user, id);
  res.status(200).json(result);
});

//* 칵테일 등록
const createCocktail = asyncHandler(async (req, res) => {
  const { name, base, description, ingredient, tags, content, abv, sweet, bitter, sour, newImageNames, recipeImageNames } = req.body;
  await cocktailService.createCocktail({ name, base, description, ingredient, tags, content, abv, sweet, bitter, sour, newImageNames, recipeImageNames });
  res.status(201).json({ message: '칵테일 등록 성공' });
});

//* 칵테일 수정
const updateCocktail = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { name, base, description, ingredient, tags, content, abv, sweet, bitter, sour, newImageNames, recipeImageNames } = req.body;
  await cocktailService.updateCocktail(id, { name, base, description, ingredient, tags, content, abv, sweet, bitter, sour, newImageNames, recipeImageNames });
  res.status(200).json({ message: '칵테일 수정 성공' });
});

//* 칵테일 삭제
const deleteCocktail = asyncHandler(async (req, res) => {
  const id = req.params.id;
  await cocktailService.deleteCocktail(id);
  res.status(204).json({ message: "칵테일 삭제" });
});

module.exports = {
  getCustomCocktail,
  getCocktailList,
  getCocktail,
  createCocktail,
  updateCocktail,
  deleteCocktail,
};