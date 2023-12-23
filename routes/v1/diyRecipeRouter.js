const express = require('express');
const router = express.Router();
const diyRecipeController = require('../../controllers/diyRecipeController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');

router.get('/:id/users', diyRecipeController.getDiyRecipeListByUser); // 사용자의 리뷰 목록 조회
router.get('/:id', diyRecipeController.getDiyRecipe); // DIY 레시피 상세 조회
router.get('/', diyRecipeController.getDiyRecipeList); // DIY 레시피 목록 조회

router.post('/', checkUser, diyRecipeController.createDiyRecipe); // DIY 레시피 등록
router.put('/:id', checkUser, diyRecipeController.updateDiyRecipe); // DIY 레시피 수정
router.delete('/:id', checkUser, diyRecipeController.deleteDiyRecipe); // DIY 레시피 삭제

//post script - 형식이 비슷하여 수월하게 함

module.exports = router;
