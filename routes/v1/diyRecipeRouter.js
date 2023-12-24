const express = require('express');
const router = express.Router();
const { validateDiyRecipe } = require('../../middlewares/validators');
const diyRecipeController = require('../../controllers/diyRecipeController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
const { validationResult } = require('express-validator');

router.get('/', diyRecipeController.getDiyRecipeList); // DIY 레시피 목록 조회
router.get('/:id', diyRecipeController.getDiyRecipe); // DIY 레시피 상세 조회

router.post('/', checkUser, checkAdmin, validateDiyRecipe, (req, res, next) => { //* DIY 레시피 등록 유효성 검사
    const errors = validationResult(req); //* 유효성 검사 결과 가져오기
    if (!errors.isEmpty()) { //* 에러가 있으면
       return res.status(400).json({ errors: errors.array() }); //* 에러 메세지
    }
    diyRecipeController.createDiyRecipe(req, res, next); //* 다 통과되면 생성 허가
 });

 router.put('/:id', checkUser, checkAdmin, validateDiyRecipe, (req, res, next) => { //* DIY 레시피 수정 유효성 검사
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
    }
    diyRecipeController.updateDiyRecipe(req, res, next); //* 위 코드와 동일
 });
 
router.delete('/:id', checkUser, checkAdmin, diyRecipeController.deleteDiyRecipe); // DIY 레시피 삭제

//post script - 형식이 비슷하여 수월하게 함

module.exports = router;
