const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/reviewController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
const checkWrite = require('../../middlewares/checkWrite');
const { uploadImage, imageHandler } = require('../../middlewares/imageHandler');
const { validator, review, params } = require('../../middlewares/validators');

router.route('/search')
   .get( //* 리뷰 검색(관리자)
      checkUser,
      checkAdmin,
      reviewController.getReviewListByKeyword
   );

router.route('/users')
   .get( //* 사용자의 리뷰 목록 조회
      checkUser,
      validator(review.checkGetUserReviewList),
      reviewController.getUserReviewList
   );

router.route('/list')
   .get( //* 리뷰 목록 조회
      validator(review.checkGetReviewList),
      reviewController.getReviewList
   );

router.route('/create/:id')
   .post( //* 리뷰 등록
      checkUser,
      checkWrite,
      uploadImage,
      imageHandler,
      validator(review.checkCreateReview),
      reviewController.createReview
   );

router.route('/:id/likes')
   .post( //* 좋아요 추가
      checkUser,
      validator(params.params),
      reviewController.addLike
   )
   .delete( //* 좋아요 삭제
      checkUser,
      validator(params.params),
      reviewController.deleteLike
   );

router.route('/:id')
   .get( //* 리뷰 상세 조회
      checkUser,
      validator(params.params),
      reviewController.getReview
   )
   .put( //* 리뷰 수정
      checkUser,
      checkWrite,
      uploadImage,
      imageHandler,
      validator(review.checkUpdateReview),
      reviewController.updateReview
   )
   .delete( //* 리뷰 삭제
      checkUser,
      checkAdmin,
      validator(params.params),
      reviewController.deleteReview
   );
   
module.exports = router;