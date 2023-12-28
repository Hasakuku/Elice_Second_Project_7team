const express = require('express');
const router = express.Router();
const barController = require('../../controllers/barController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
// const { validateBar } = require('../../middlewares/validators');
const { uploadImage, imageHandler } = require('../../middlewares/imageHandler');
const { validator, bar } = require('../../middlewares/validators');

router.route('/:id')
   .get( //* 바 상세 조회
      barController.getBar
   )
   .put( //* 바 수정
      checkUser,
      checkAdmin,
      uploadImage,
      imageHandler,
      validator(bar.validationUpdateBar),
      barController.updateBar
   )
   .delete( //* 바 삭제
      checkUser,
      checkAdmin,
      barController.deleteBar
   );

router.route('/')
   .get( //* 바 목록 조회
      validator(bar.validationGetBarList),
      barController.getBarList
   )
   .post( //* 바 등록
      checkUser,
      checkAdmin,
      uploadImage,
      imageHandler,
      validator(bar.validationCreateBar),
      barController.createBar
   );

module.exports = router;
