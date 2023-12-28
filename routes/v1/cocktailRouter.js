const express = require('express');
const router = express.Router();
const cocktailController = require('../../controllers/cocktailController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
const { uploadImage, imageHandler } = require('../../middlewares/imageHandler');
const { validator, cocktail, params } = require('../../middlewares/validators');

router.route('/custom')
   .get( //* 맞춤 추천 칵테일
      checkUser,
      cocktailController.getCustomCocktail
   );

router.route('/:id')
   .get( //* 칵테일 상세 조회
      validator(params.params),
      cocktailController.getCocktail
   )
   .put( //* 칵테일 수정
      checkUser,
      checkAdmin,
      uploadImage,
      imageHandler,
      validator(cocktail.checkUpdateCocktail),
      cocktailController.updateCocktail
   )
   .delete( //* 칵테일 삭제
      checkUser,
      checkAdmin,
      validator(params.params),
      cocktailController.deleteCocktail
   );

router.route('/')
   .get( //* 칵테일 목록 조회
      validator(cocktail.checkGetCocktailList),
      cocktailController.getCocktailList
   )
   .post( //* 칵테일 등록
      checkUser,
      checkAdmin,
      uploadImage,
      imageHandler,
      validator(cocktail.checkCreateCocktail),
      cocktailController.createCocktail
   );

module.exports = router;
