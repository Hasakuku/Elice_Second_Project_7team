const express = require('express');
const userController = require('../../controllers/userController');
const checkUser = require('../../middlewares/checkUser');
const router = express.Router();

// router.get('/wishlist', checkUser, userController.getWishListByType);
router.get('/wishlist', userController.getWishListByType);
// router.delete('/wishlist/:id', checkUser, userController.getWishListByType);
router.delete('/wishlist/:id', userController.deleteWish);
router.get('/', checkUser, userController.getUser);
router.put('/', checkUser, userController.updateUser);
router.delete('/', checkUser, userController.withdrawal);

module.exports = router;
