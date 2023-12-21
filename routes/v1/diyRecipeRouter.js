const express = require('express');
const router = express.Router();
const diyRecipeController = require('../../controllers/diyRecipeController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');

router.get('/', diyRecipeController.getDiyRecipeList); // DIY 레시피 목록 조회
router.get('/:id', diyRecipeController.getDiyRecipe); // DIY 레시피 상세 조회

router.post('/', checkUser, checkAdmin, diyRecipeController.createDiyRecipe); // DIY 레시피 등록
router.put('/:id', checkUser, checkAdmin, diyRecipeController.updateDiyRecipe); // DIY 레시피 수정
router.delete('/:id', checkUser, checkAdmin, diyRecipeController.deleteDiyRecipe); // DIY 레시피 삭제

//post script - 형식이 비슷하여 수월하게 함

module.exports = router;
