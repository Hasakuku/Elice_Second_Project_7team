const express = require('express');
const router = express.Router();
const diyRecipeController = require('../../controllers/diyRecipeController');
const checkUser = require('../../middlewares/checkUser');
const checkWrite = require('../../middlewares/checkWrite');
const { uploadImage, imageHandler } = require('../../middlewares/imageHandler');
const { validate, diyRecipe } = require('../../middlewares/validators');

router.get('/users', checkUser, validate(diyRecipe.checkGetDiyRecipeListByUser), diyRecipeController.getDiyRecipeListByUser); // 사용자의 레시피 목록 조회
router.get('/:id', diyRecipeController.getDiyRecipe); // DIY 레시피 상세 조회
router.get('/', validate(diyRecipe.checkGetDiyRecipeList), diyRecipeController.getDiyRecipeList); // DIY 레시피 목록 조회

router.post('/', checkUser, checkWrite, uploadImage, imageHandler, validate(diyRecipe.checkCreateDiyRecipe), diyRecipeController.createDiyRecipe); // DIY 레시피 등록
router.put('/:id', checkUser, checkWrite, uploadImage, imageHandler, validate(diyRecipe.checkUpdateDiyRecipe), diyRecipeController.updateDiyRecipe); // DIY 레시피 수정
router.delete('/:id', checkUser, diyRecipeController.deleteDiyRecipe); // DIY 레시피 삭제

module.exports = router;
