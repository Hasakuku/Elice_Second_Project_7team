const asyncHandler = require('express-async-handler');
const kakaoService = require('../services/kakaoService');
const config = require('../config');
const { NotFoundError, } = require('../utils/customError');

const redirectKakaoPage = asyncHandler(async (req, res) => {
    res.redirect(config.kakaoAuthURI);
});
const redirectWithdrawal = asyncHandler(async (req, res) => {
    res.redirect(config.kakaoWirhdrawalURI);
});

const loginKakao = asyncHandler(async (req, res) => {
    const code = req.query.code;
    if (!code) throw new NotFoundError("요청 code 없음");
    const result = await kakaoService.login(code);
    res.cookie('jwtToken', result, { httpOnly: true });
    res.status(201).json({ message: "로그인 성공" });
    //^ 백엔드 테스트시 아래 주석 해제 윗줄 주석
    // res.status(201).redirect("http://localhost:3000");
});

const withdrawalKakao = asyncHandler(async (req, res) => {
    // const kakaoToken = req.cookies.accessToken;
    // if (!kakaoToken) throw new NotFoundError('쿠키에 accessToken 없음');
    const code = req.query.code;
    if (!code) throw new NotFoundError("요청 code 없음");
    await kakaoService.withdrawalKakao(code);
    res.cookie('accessToken', null, { maxAge: 0 });
    res.cookie('jwtToken', null, { maxAge: 0 });
    res.cookie('refreshToken', null, { maxAge: 0 });
    res.status(204).json({ message: "사용자 탈퇴" });
});


module.exports = { loginKakao, redirectKakaoPage, withdrawalKakao, redirectWithdrawal };