const dotenv = require("dotenv");
const { InternalServerError } = require("../utils/customError");

dotenv.config();

const envVariables = [
   'MONGODB_URL',
   'JWT_SECRET',
   'FRONTEND_URL',
   'REDIRECT_URI',
   'KAKAO_API_KEY',
   // 'NODE_ENV',
   'WITHDRAWAL_REDIRECT_URI',
];

envVariables.forEach(name => {
   if (!process.env[name]) {
      throw new InternalServerError('환경 변수 미설정');
   }
});
const KAKAO_API_KEY = process.env.KAKAO_API_KEY;
const REDIRECT_URI = process.env.REDIRECT_URI;
const KAKAO_AUTH_URI = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile_nickname,account_email`;
const WITHDRAWAL_REDIRECT_URI = process.env.WITHDRAWAL_REDIRECT_URI;
const KAKAO_WITHDRAWAL_URI = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_API_KEY}&redirect_uri=${WITHDRAWAL_REDIRECT_URI}&response_type=code&scope=profile_nickname,account_email`;

module.exports = {
   port: parseInt(process.env.PORT) || 3000,
   nodeEnv: process.env.NODE_ENV,
   mongodbURI: process.env.MONGODB_URL,
   jwtSecret: process.env.JWT_SECRET,
   frontendURI: process.env.FRONTEND_URL,
   redirectURI: REDIRECT_URI,
   kakaoApiKey: KAKAO_API_KEY,
   kakaoAuthURI: KAKAO_AUTH_URI,
   withdrawalRedirectURI: WITHDRAWAL_REDIRECT_URI,
   kakaoWirhdrawalURI: KAKAO_WITHDRAWAL_URI
};