const asyncHandler = require('express-async-handler')
const kakaoService = require('../services/kakaoService');
const { NotFoundError, UnauthorizedError } = require('../utils/customError');

const loginKakao = asyncHandler(async (req, res) => {
    const code = req.query.code;
    if (!code) throw new NotFoundError("요청 code 없음")
    const result = await kakaoService.login(code);
    res.cookie('jwtToken', result.jwtToken, { httpOnly: true });
    res.cookie('accessToken', result.accessToken, { httpOnly: true });
    res.cookie('refreshToken', result.refreshToken, { httpOnly: true });
    res.status(201).json({ message: "로그인 성공" });
    //^ 백엔드 테스트시 아래 주석 해제 윗줄 주석
    // res.status(201).redirect("http://localhost:3000");
});

const logoutKakao = asyncHandler(async (req, res) => {
    const kakaoToken = req.cookies.accessToken
    if (!kakaoToken) throw new NotFoundError("쿠키에 accessToken 없음")
    await kakaoService.logoutKakao(kakaoToken)
    res.cookie('accessToken', null, { maxAge: 0 })
    res.cookie('jwtToken', null, { maxAge: 0 });
    res.cookie('refreshToken', null, { maxAge: 0 });
    res.status(200).json({ message: "로그아웃 성공" })
})

const refreshToken = asyncHandler(async (req, res) => {
    let accessToken = req.cookies.accessToken;
    let refreshToken = req.cookies.refreshToken;
    const result = await kakaoService.refreshToken(accessToken, refreshToken);
    res.cookie('jwtToken', result.jwtToken, { httpOnly: true });
    res.cookie('accessToken', result.accessToken, { httpOnly: true });
    res.cookie('refreshToken', result.refreshToken, { httpOnly: true });
    res.status(200).json({ message: "토큰 갱신 성공" });
});

const withdrawalKakao = asyncHandler(async (req, res) => {
    const headers = req.headers["authorization"];
    if (!headers) throw new NotFoundError("헤더에 토큰 없음")
    const kakaoToken = headers.split(" ");
    await userService.withdrawalKakao(kakaoToken)
    res.clearCookie('accessToken')
    res.status(204).json({ message: "로그아웃 성공" })
});


module.exports = { loginKakao, logoutKakao, withdrawalKakao, refreshToken };