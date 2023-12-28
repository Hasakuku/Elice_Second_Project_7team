const express = require('express');
const router = express.Router();
const cocktailController = require('../../controllers/cocktailController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
const { uploadImage, imageHandler } = require('../../middlewares/imageHandler');
const { validator, cocktail } = require('../../middlewares/validators');

router.get('/custom', checkUser, cocktailController.getCustomCocktail); // 맞춤 추천 칵테일
router.get('/:id', cocktailController.getCocktail); // 칵테일 상세 조회
router.get('/', validator(cocktail.checkGetCocktailList), cocktailController.getCocktailList); // 칵테일 목록 조회

router.post('/', checkUser, checkAdmin, uploadImage, imageHandler, validator(cocktail.checkCreateCocktail), cocktailController.createCocktail); // 칵테일 등록
router.put('/:id', checkUser, checkAdmin, uploadImage, imageHandler, validator(cocktail.checkUpdateCocktail), cocktailController.updateCocktail); // 칵테일 수정
router.delete('/:id', checkUser, checkAdmin, cocktailController.deleteCocktail); // 칵테일 삭제

module.exports = router;
