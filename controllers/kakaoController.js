const asyncHandler = require('express-async-handler')
const userService = require('../services/userService');
const { NotFoundError } = require('../utils/customError');

const loginKakao = asyncHandler(async (req, res) => {
    const headers = req.headers["authorization"];
    if(!headers) throw new NotFoundError("헤더에 토큰 없음")
    const kakaoToken = headers.split(" ");
    
    const token = await userService.loginKakao(kakaoToken);
    res.cookie('accessToken', token, { maxAge: 3600000, httpOnly: true });
    res.status(201).json({ message: "로그인 성공" })
})

const logoutKakao = asyncHandler(async (req, res) => {
    const headers = req.headers["authorization"];
    if(!headers) throw new NotFoundError("헤더에 토큰 없음")
    const kakaoToken = headers.split(" ");
    
    await userService.logoutKakao(kakaoToken)
    res.clearCookie('accessToken')
    res.status(200).json({ message: "로그아웃 성공" })
})

const withdrawalKakao = asyncHandler(async(req,res) => {
    const headers = req.headers["authorization"];
    if(!headers) throw new NotFoundError("헤더에 토큰 없음")
    const kakaoToken = headers.split(" ");
    await userService.withdrawalKakao(kakaoToken)
    res.clearCookie('accessToken')
    res.status(204).json({ message: "로그아웃 성공" })
});


module.exports = { loginKakao, logoutKakao, withdrawalKakao};