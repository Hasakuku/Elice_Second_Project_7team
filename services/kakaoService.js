const axios = require('axios');
const setToken = require('../utils/jwtToken');
const config = require("../config");
const User = require("../models/userModel");
const { UnauthorizedError, InternalServerError } = require("../utils/customError");

const kakaoService = {
   //* 로그인과 회원가입
   async login(code) {
      const newToken = await axios.post('https://kauth.kakao.com/oauth/token',
         `grant_type=authorization_code&client_id=${config.kakaoApiKey}&redirect_uri=${config.redirectURI}&code=${code}`,
         {
            headers: {
               'content-type': 'application/x-www-form-urlencoded'
            },
         });

      let accessToken = newToken.data.access_token;
      let refreshToken = newToken.data.refresh_token;

      const user = await axios.get('https://kapi.kakao.com/v2/user/me',
         {
            headers: {
               Authorization: `Bearer ${accessToken}`
            }
         });

      const checkUser = await User.findOne({ email: user.data.kakao_account.email }).lean();
      const data = {
         nickname: user.data.kakao_account.profile.nickname,
         email: user.data.kakao_account.email,
      };
      // DB에 유저가 없다면 회원가입
      if (!checkUser) {
         const newUser = new User(data);
         await newUser.save();
         const jwtToken = setToken(newUser);
         return {
            jwtToken: jwtToken,
            accessToken: accessToken,
            refreshToken: refreshToken
         };
      }
      // JWT 토큰 발행
      const jwtToken = setToken(checkUser);
      return {
         jwtToken: jwtToken,
         accessToken: accessToken,
         refreshToken: refreshToken
      };
   },
   //* 로그아웃
   async logoutKakao(kakaoToken) {
      // 카카오 로그아웃 API 호출
      const result = await axios.post("https://kapi.kakao.com/v1/user/logout", {}, {
         headers: {
            Authorization: `Bearer ${kakaoToken}`,
         },
      });

      // 로그아웃 성공 여부 확인
      if (result.status !== 200) {
         throw new UnauthorizedError('카카오 로그아웃 실패');
      }
   },
   async withdrawalKakao(kakaoToken) {

   },
   async getUser(user) {
      const id = user._id
      const foundUser = await User.findOne({ _id: id, deletedAt: null }).lean()
      return {
         _id: foundUser._id,
         email: foundUser.email,
         isAdmin: foundUser.isAdmin,
         isWrite: foundUser.isWrite,
      }
   },
   //* 토큰 갱신
   async refreshToken(accessToken, refreshToken) {

      const refreshedToken = await axios.post('https://kauth.kakao.com/oauth/token',
         `grant_type=refresh_token&client_id=${config.kakaoApiKey}&refresh_token=${refreshToken}`,
         {
            headers: {
               'content-type': 'application/x-www-form-urlencoded'
            },
         });
      accessToken = refreshedToken.data.access_token;
      refreshToken = refreshedToken.data.refresh_token;

      const user = await axios.get('https://kapi.kakao.com/v2/user/me',
         {
            headers: {
               Authorization: `Bearer ${accessToken}`
            }
         });

      const checkUser = await User.findOne({ email: user.data.kakao_account.email }).lean();
      const jwtToken = setToken(checkUser);
      return {
         jwtToken: jwtToken,
         accessToken: accessToken,
         refreshToken: refreshToken
      };
   }
};

module.exports = kakaoService;
