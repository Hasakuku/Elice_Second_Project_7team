const express = require('express');
const router = express.Router();
const kakaoController = require('../../controllers/kakaoController');

router.post('/kakao/login', kakaoController.loginKakao)
router.post('/kakao/logout', kakaoController.logoutKakao)
router.post('/kakao/withdrawal', kakaoController.withdrawalKakao)

module.exports = router