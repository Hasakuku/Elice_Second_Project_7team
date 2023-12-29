const axios = require('axios');
const setToken = require('../utils/setToken');
const config = require("../config");
const { User } = require('../models');
const { InternalServerError, NotFoundError } = require("../utils/customError");

const kakaoService = {
   //* 로그인과 회원가입
   async login(code) {
      // 카카오 토큰 받기
      const newToken = await axios.post('https://kauth.kakao.com/oauth/token',
         `grant_type=authorization_code&client_id=${config.kakaoApiKey}&redirect_uri=${config.redirectURI}&code=${code}`,
         {
            headers: {
               'content-type': 'application/x-www-form-urlencoded'
            },
         });

      const accessToken = newToken.data.access_token;
      const refreshToken = newToken.data.refresh_token;
      // 토큰으로 유저정보 얻기
      const user = await axios.get('https://kapi.kakao.com/v2/user/me',
         {
            headers: {
               Authorization: `Bearer ${accessToken}`
            }
         });
      const data = {
         kakaoId: user.data.id,
         nickname: user.data.kakao_account.profile.nickname,
         image: user.data.kakao_account.profile.image,
         email: user.data.kakao_account.email,
      };

      let checkUser = await User.findOne({ kakaoId: user.data.id, }).lean();
      // DB에 유저가 없다면 회원가입
      if (!checkUser) {
         const colorType = ['#B2EEFF', '#FFB6B5', '#CBEDB0', '#FFE99A', '#E4D7FF'];
         data.profileColor = colorType[Math.floor(Math.random() * colorType.length)];
         const newUser = new User(data);
         checkUser = await newUser.save();
      } else if (checkUser.deletedAt !== null) { // 사용자가 있지만 deletedAt이 null이 아닌 경우
         await User.updateOne({ kakaoId: user.data.id }, { $set: { deletedAt: null } }, { runValidators: true });
         checkUser = await User.findOne({ kakaoId: user.data.id, }).lean();
      }
      // JWT 토큰 발행
      const jwtToken = setToken(checkUser);
      return jwtToken;
   },
   //* 카카오 연결 해제
   async withdrawalKakao(code) {
      const newToken = await axios.post('https://kauth.kakao.com/oauth/token',
         `grant_type=authorization_code&client_id=${config.kakaoApiKey}&redirect_uri=${config.withdrawalRedirectURI}&code=${code}`,
         {
            headers: {
               'content-type': 'application/x-www-form-urlencoded'
            },
         });

      const kakaoToken = newToken.data.access_token;
      // 카카오 토큰으로 유저정보얻기
      const user = await axios.get('https://kapi.kakao.com/v2/user/me',
         {
            headers: {
               Authorization: `Bearer ${kakaoToken}`
            }
         });
      const kakaoId = user.data.id;
      const checkUser = await User.findOne({ kakaoId: kakaoId, }).lean();

      if (!checkUser) throw new NotFoundError('사용자 정보가 없음');
      // 카카오 연결해제 API 호출
      const result = await axios.post("https://kapi.kakao.com/v1/user/unlink", {
         target_id_type: "user_id",
         target_id: kakaoId,
      }, {
         headers: {
            Authorization: `Bearer ${kakaoToken}`,
         },
      });
      if (result.data.id !== kakaoId) throw new InternalServerError('카카오 서버 오류');
      // 유저 deletedAt 해제시간으로 설정
      await User.updateOne({ kakaoId: kakaoId }, { $set: { deletedAt: new Date() } });
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

      const checkUser = await User.findOne({ kakaoId: user.data.id }).lean();
      const jwtToken = setToken(checkUser);
      return {
         jwtToken: jwtToken,
         accessToken: accessToken,
         refreshToken: refreshToken
      };
   }
};

module.exports = kakaoService;