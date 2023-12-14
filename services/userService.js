const User = require('../models/userModel');
const axios = require('axios');
const setJwt = require('../utils/jwtToken')
const { BadRequestError, UnauthorizedError } = require('../utils/customError')
const userService = {
   async loginKakao(kakaoToken) {
      // 카카오 로그인 api 호출
      const result = await axios.get("https://kapi.kakao.com/v2/user/me", {
         headers: {
            Authorization: `Bearer ${kakaoToken}`,
         },
      });

      const { data } = result
      const nickname = data.properties.nickname;
      const email = data.kakao_account.email;

      if (!nickname || !email) throw new BadRequestError("잘못된 요청 토큰");

      let user = await User.findOne({ email: email });
      // 유저가 없다면 회원 가입
      if (!user) {
         user = new User({
            email, nickname,
         })
         await user.save();
      }
      const token = setJwt(user);
      return token;
   },
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
      const findUser = await User.findOne({ _id: id, deletedAt: null })
      return {
         _id: findUser._id,
         email: findUser.email,
         isAdmin: findUser.isAdmin,
         isWrite: findUser.isWrite,
      }
   },
   async updateUser(user, email, nickname) {
      const id = user._id
      const updatedUser = await User.findByIdAndUpdate(
         id,
         { email, nickname },
      );
      if (updatedUser.modifiedCount === 0) {
         throw new InternalServerError('서버 오류');
      }
   },
   async withdrawal(user) {
      const id = user._id
      const withdrawalUser = await User.findByIdAndUpdate(
         id,
         { deletedAt: new Date() }
      )
      if(!withdrawalUser.modifiedCount === 0) {
         throw new InternalServerError('서버 오류');
      }
   }
}

module.exports = userService