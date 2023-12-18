const express = require('express');
const router = express.Router();
const kakaoController = require('../../controllers/kakaoController');

router.get('/kakao/user', kakaoController.loginKakao);
router.get('/kakao', kakaoController.redirectKakaoPage);
router.post('/kakao/user', kakaoController.refreshToken);
router.post('/kakao/logout', kakaoController.logoutKakao);
router.delete('/kakao/withdrawal', kakaoController.withdrawalKakao);

module.exports = router;