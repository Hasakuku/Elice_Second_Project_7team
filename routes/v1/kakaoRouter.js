const express = require('express');
const router = express.Router();
const kakaoController = require('../../controllers/kakaoController');

router.get('/kakao/user',  kakaoController.loginKakao);
router.get('/kakao/withdrawal',  kakaoController.withdrawalKakao);

router.get('/kakao/redirectWithdrawal',  kakaoController.redirectWithdrawal);
router.get('/kakao/redirectLogin',  kakaoController.redirectKakaoPage);
module.exports = router;