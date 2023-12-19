const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/reviewController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');

router.get('/search', reviewController.getReviewListByKeyword);
router.get('/users', reviewController.getUserReviewList);
router.get('/list', reviewController.getReviewList);
router.get('/:id',  reviewController.getReview);

router.put('/:id',  reviewController.updateReview);
router.post('/create/:id',  reviewController.createReview);

router.delete('/:id/users',  reviewController.deleteUserReview);
router.delete('/:id', reviewController.deleteReview);
module.exports = router;