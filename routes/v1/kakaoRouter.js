const express = require('express');
const router = express.Router();
const kakaoController = require('../../controllers/kakaoController');
const { validateKakao } = require('../../middlewares/validators');

router.get('/kakao/user', validateKakao, kakaoController.loginKakao);
router.get('/kakao/withdrawal', validateKakao, kakaoController.withdrawalKakao);

router.get('/kakao/redirectWithdrawal', validateKakao, kakaoController.redirectWithdrawal);
router.get('/kakao/redirectLogin', validateKakao, kakaoController.redirectKakaoPage);
module.exports = router;