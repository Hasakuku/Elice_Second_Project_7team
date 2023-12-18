const express = require('express');
const userController = require('../../controllers/userController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
const router = express.Router();

// 찜 목록
router.get('/wishlist', checkUser, userController.getWishListByType);
router.delete('/wishlist/:id', checkUser, userController.getWishListByType);

//관리자
router.put('/permissions', checkUser, checkAdmin, userController.updateUserPermission);
router.get('/', checkUser, checkAdmin, userController.getUserList);
router.delete('/delete', checkUser, checkAdmin, userController.deleteUser);

router.get('/mypage', checkUser, userController.getUser);
router.put('/mypage', checkUser, userController.updateUser);
router.delete('/logout', checkUser, userController.logout);
router.delete('/withdrawal', checkUser, userController.withdrawal);

module.exports = router;
