const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const connectMongoDB = require('./db');
const config = require('./config');
const router = require('./routes');

connectMongoDB(); // 몽고DB 연결

// 개발환경에서만 cors 사용
const isDevelopment = config.nodeEnv !== 'production ';

if (isDevelopment) {
  app.use(
    cors({
      // origin: config.frontendURI, // 출처 허용 옵션
      origin:'*',
      credentials: true, // 사용자 인증이 필요한 리소스(쿠키 등) 접근
    }));
  app.use(logger('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


//^ 백엔드 테스트시 아래 주석 해제
// app.use(express.static('public'));
app.use(express.static('images'));

app.use("/api", router);

// error handler
app.use(function (err, req, res, next) {
  if (err instanceof mongoose.Error || err.status === undefined) {
    console.log("서버 오류 :", err.message);
    res.status(500).json({ message: '서버 오류' });
  } else {
    res.status(err.status || 500).json({ message: err.message });
  }
});

app
  .listen(config.port, () =>
    console.log(`
############################
#     Server is start!     #
############################`))
  .on("error", () => {
    console.error('error');
    process.exit(1);
  });