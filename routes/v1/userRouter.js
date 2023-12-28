const express = require('express');
const userController = require('../../controllers/userController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
const router = express.Router();
const { validator, user, params } = require('../../middlewares/validators');


router.route('/mypage')
   .get( //* 사용자 정보 조회
      checkUser,
      userController.getUser
   )
   .put( //* 사용자 정보 수정
      checkUser,
      validator(user.validationUpdateUser),
      userController.updateUser
   );

router.route('/wishlist/:id')
   .post(
      checkUser,
      validator(params.params),
      userController.createWish
   ) //* 사용자 찜 추가
   .delete(
      checkUser,
      validator(params.params),
      userController.deleteWish
   ); //* 사용자 찜 삭제

router.route('/wishlist')
   .get(checkUser, validator(user.validationGetWishListByType), userController.getWishListByType); //* 사용자 찜 목록 조회

router.route('/custom')
   .put(checkUser, validator(user.validationUpdateUserCustom), userController.updateUserCustom); //* 사용자 커스텀 설정

router.route('/login')
   .post(userController.login); //* 기본 로그인

router.route('/logout')
   .delete(checkUser, userController.logout); //* 로그아웃

router.route('/withdrawal')
   .delete(checkUser, userController.withdrawal); //* 사용자 탈퇴


router.put('/:id/permissions', //* 사용자 권한 수정(관리자)
   checkUser,
   checkAdmin,
   validator(params.params),
   userController.updateUserPermission
);
router.delete('/:id/delete', //* 사용자 삭제(관리자)
   checkUser,
   checkAdmin,
   validator(params.params),
   userController.deleteUser
);

router.get('/', //* 사용자 목록 조회(관리자)
   checkUser,
   checkAdmin,
   validator(user.validationGetUserList),
   userController.getUserList
);
module.exports = router;
