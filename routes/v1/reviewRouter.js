const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/reviewController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
const checkWrite = require('../../middlewares/checkWrite');
const { uploadImage, imageHandler } = require('../../middlewares/imageHandler');
const { validate, review } = require('../../middlewares/validators');
// const { validateCocktailReview } = require('../../middlewares/validators');

router.get('/search', checkUser, checkAdmin, reviewController.getReviewListByKeyword);
router.get('/users', checkUser, validate(review.checkGetUserReviewList), reviewController.getUserReviewList);
router.get('/list', validate(review.checkGetReviewList), reviewController.getReviewList);
router.get('/:id', checkUser, reviewController.getReview);

router.put('/:id', checkUser, checkWrite, uploadImage, imageHandler, validate(review.checkUpdateReview), reviewController.updateReview);
router.post('/create/:id', checkUser, checkWrite, uploadImage, imageHandler, validate(review.checkCreateReview), reviewController.createReview);
router.post('/:id/likes', checkUser, reviewController.addLike);

router.delete('/:id/likes', checkUser, reviewController.deleteLike);
router.delete('/:id', checkUser, checkAdmin, reviewController.deleteReview);

module.exports = router;