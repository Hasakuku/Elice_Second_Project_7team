const express = require('express');
const userController = require('../../controllers/userController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
const router = express.Router();
const { validator, user } = require('../../middlewares/validators');


router.get('/mypage', //* 사용자 정보 조회
   checkUser,
   userController.getUser);
router.put('/mypage', //* 사용자 정보 수정
   checkUser,
   validator(user.validationUpdateUser),
   userController.updateUser);

router.get('/wishlist', //* 사용자 찜 목록 조회
   checkUser,
   validator(user.validationGetWishListByType),
   userController.getWishListByType);
router.post('/wishlist/:id', //* 사용자 찜 추가
   checkUser,
   userController.createWish);
router.delete('/wishlist/:id', //* 사용자 찜 삭제
   checkUser,
   userController.deleteWish);

router.put('/custom', //* 사용자 커스텀 설정
   checkUser,
   validator(user.validationUpdateUserCustom),
   userController.updateUserCustom);

router.post('/login', userController.login); //* 기본 로그인
router.delete('/logout', //* 로그아웃
   checkUser,
   userController.logout);
router.delete('/withdrawal', //* 사용자 탈퇴
   checkUser,
   userController.withdrawal);

router.put('/:id/permissions', //* 사용자 권한 수정(관리자)
   checkUser,
   checkAdmin,
   userController.updateUserPermission);
router.delete('/:id/delete', //* 사용자 삭제(관리자)
   checkUser,
   checkAdmin,
   userController.deleteUser);
router.get('/', //* 사용자 목록 조회(관리자)
   checkUser,
   checkAdmin,
   validator(user.validationGetUserList),
   userController.getUserList);

module.exports = router;
