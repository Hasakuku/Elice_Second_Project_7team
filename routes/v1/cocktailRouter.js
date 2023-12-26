const express = require('express');
const router = express.Router();
const cocktailController = require('../../controllers/cocktailController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
const { validateCocktail } = require('../../middlewares/validators');

router.get('/custom', cocktailController.getCustomCocktail); // 맞춤 추천 칵테일
router.get('/:id', cocktailController.getCocktail); // 칵테일 상세 조회
router.get('/', cocktailController.getCocktailList); // 칵테일 목록 조회

router.post('/', checkUser, checkAdmin, validateCocktail, cocktailController.createCocktail); // 칵테일 등록
router.put('/:id', checkUser, checkAdmin, validateCocktail , cocktailController.updateCocktail); // 칵테일 수정
router.delete('/:id', checkUser, checkAdmin, cocktailController.deleteCocktail); // 칵테일 삭제

module.exports = router;
