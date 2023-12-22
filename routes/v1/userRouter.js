const express = require('express');
const userController = require('../../controllers/userController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
const router = express.Router();


router.get('/wishlist', checkUser, userController.getWishListByType);
router.get('/mypage', checkUser, userController.getUser);
router.get('/', checkUser, checkAdmin, userController.getUserList);

router.post('/wishlist/:id', checkUser, userController.createWish);

router.put('/mypage', checkUser, userController.updateUser);
router.put('/permissions/:id', checkUser, checkAdmin, userController.updateUserPermission);

router.delete('/wishlist/:id', checkUser, userController.deleteWish);
router.delete('/delete', checkUser, checkAdmin, userController.deleteUser);
router.delete('/logout', checkUser, userController.logout);
router.delete('/withdrawal', checkUser, userController.withdrawal);

router.post('/login', userController.login);

module.exports = router;
