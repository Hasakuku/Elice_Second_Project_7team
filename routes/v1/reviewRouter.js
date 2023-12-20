const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/reviewController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
const checkWrite = require('../../middlewares/checkWrite');

router.get('/search', checkUser, checkAdmin, reviewController.getReviewListByKeyword);
router.get('/users', checkUser, reviewController.getUserReviewList);
router.get('/list', checkUser, reviewController.getReviewList);
router.get('/:id', checkUser, reviewController.getReview);

router.put('/:id', checkUser, checkWrite, reviewController.updateReview);
router.post('/create/:id', checkUser, checkWrite, reviewController.createReview);
router.post(':id/likes', reviewController.addLike);

router.delete(':id/likes', reviewController.deleteLike);
router.delete('/:id/users', checkUser, reviewController.deleteUserReview);
router.delete('/:id', checkUser, checkAdmin, reviewController.deleteReview);

// 로그인 없이 테스트 시 해제 // checkUser, checkAdmin, 

module.exports = router;