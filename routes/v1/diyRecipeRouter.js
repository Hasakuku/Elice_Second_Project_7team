const express = require('express');
const router = express.Router();
const diyRecipeController = require('../../controllers/diyRecipeController');
const checkUser = require('../../middlewares/checkUser');
const checkWrite = require('../../middlewares/checkWrite');
const { uploadImage, imageHandler } = require('../../middlewares/imageHandler');
const { validator, diyRecipe, params } = require('../../middlewares/validators');

router.route('/users')
   .get( //* 사용자의 레시피 목록 조회
      checkUser,
      validator(diyRecipe.validationGetDiyRecipeListByUser),
      diyRecipeController.getDiyRecipeListByUser
   );

router.route('/:id')
   .get( //* DIY 레시피 상세 조회
      validator(params.params),
      diyRecipeController.getDiyRecipe
   )
   .put( //* DIY 레시피 수정
      checkUser,
      checkWrite,
      uploadImage,
      imageHandler,
      validator(diyRecipe.validationUpdateDiyRecipe),
      diyRecipeController.updateDiyRecipe
   )
   .delete( //* DIY 레시피 삭제
      checkUser,
      validator(params.params),
      diyRecipeController.deleteDiyRecipe
   );

router.route('/')
   .get( //* DIY 레시피 목록 조회
      validator(diyRecipe.validationGetDiyRecipeList),
      diyRecipeController.getDiyRecipeList
   )
   .post( //* DIY 레시피 등록
      checkUser,
      checkWrite,
      uploadImage,
      imageHandler,
      validator(diyRecipe.validationCreateDiyRecipe),
      diyRecipeController.createDiyRecipe
   );

module.exports = router;
