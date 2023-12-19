const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/reviewController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');

router.get('/search', checkUser, checkAdmin, reviewController.getReviewListByKeyword);
router.get('/users', checkUser, reviewController.getUserReviewList);
router.get('/list', checkUser, reviewController.getReviewList);
router.get('/:id', checkUser, reviewController.getReview);

router.put('/:id', checkUser, reviewController.updateReview);
router.post('/create/:id', checkUser, reviewController.createReview);

router.delete('/:id/users', checkUser, reviewController.deleteUserReview);
router.delete('/:id', checkUser, checkAdmin, reviewController.deleteReview);
module.exports = router;