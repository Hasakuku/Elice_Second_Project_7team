const express = require('express');
const router = express.Router();
const baseController = require('../../controllers/baseController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
const { uploadImage, imageHandler } = require('../../middlewares/imageHandler');
const {validator, base} = require('../../middlewares/validators');

router.route('/:id')
   .get( //* 베이스 상세 조회
      baseController.getBase
   )
   .put( //* 베이스 수정
      checkUser,
      checkAdmin,
      uploadImage,
      imageHandler,
      validator(base.validationUpdateBase),
      baseController.updateBase
   )
   .delete( //* 베이스 삭제
      checkUser,
      checkAdmin,
      baseController.deleteBase
   );

router.route('/')
   .get( //* 베이스 목록 조회
      validator(base.validationGetBaseList),
      baseController.getBaseList
   )
   .post( //* 베이스 등록
      checkUser,
      checkAdmin,
      uploadImage,
      imageHandler,
      validator(base.validationCreateBase),
      baseController.createBase
   );

module.exports = router;