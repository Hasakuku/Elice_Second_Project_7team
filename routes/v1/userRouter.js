const express = require('express');
const userController = require('../../controllers/userController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
const router = express.Router();
const { validationGetUsers, validationPutUsers, validationGetUsersWishList } = require('../../middlewares/validators/user');


router.get('/wishlist', checkUser, validationGetUsersWishList, userController.getWishListByType);
router.get('/mypage', checkUser, validationGetUsers, userController.getUser);
router.get('/', checkUser, checkAdmin, validationGetUsers, userController.getUserList);

router.post('/wishlist/:id', checkUser, userController.createWish);

router.put('/custom', checkUser, validationPutUsers, userController.updateUserCustom);
router.put('/mypage', checkUser, validationPutUsers, userController.updateUser);
router.put('/:id/permissions', checkUser, checkAdmin, validationPutUsers, userController.updateUserPermission);

router.delete('/wishlist/:id', checkUser, userController.deleteWish);
router.delete('/:id/delete', checkUser, checkAdmin, userController.deleteUser);
router.delete('/logout', checkUser, userController.logout);
router.delete('/withdrawal', checkUser, userController.withdrawal);

router.post('/login', userController.login);

module.exports = router;
