const express = require('express');
const router = express.Router();
const diyRecipeController = require('../../controllers/diyRecipeController');
const checkUser = require('../../middlewares/checkUser');
// const { validateDiyRecipe } = require('./validationMiddleware');
const checkWrite = require('../../middlewares/checkWrite');
const { uploadImage, imageHandler } = require('../../middlewares/imageHandler');

router.get('/users', checkUser, diyRecipeController.getDiyRecipeListByUser); // 사용자의 레시피 목록 조회
router.get('/:id', diyRecipeController.getDiyRecipe); // DIY 레시피 상세 조회
router.get('/', diyRecipeController.getDiyRecipeList); // DIY 레시피 목록 조회

router.post('/', checkUser,  checkWrite, uploadImage, imageHandler, diyRecipeController.createDiyRecipe); // DIY 레시피 등록
router.put('/:id', checkUser,  checkWrite, uploadImage, imageHandler, diyRecipeController.updateDiyRecipe); // DIY 레시피 수정
router.delete('/:id', checkUser, diyRecipeController.deleteDiyRecipe); // DIY 레시피 삭제

module.exports = router;
