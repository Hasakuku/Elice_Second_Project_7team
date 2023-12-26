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
    res.status(201).redirect(config.frontendURI);
});

const withdrawalKakao = asyncHandler(async (req, res) => {
    const code = req.query.code;
    if (!code) throw new NotFoundError("요청 code 없음");
    await kakaoService.withdrawalKakao(code);
    res.cookie('jwtToken', null, { maxAge: 0 });
    res.status(204).redirect(config.frontendURI);
});

module.exports = { loginKakao, redirectKakaoPage, withdrawalKakao, redirectWithdrawal, };