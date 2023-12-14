const express = require('express');
const app = express();
const cors = require('express')
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const connectMongoDB = require('./db')
const { port, frontendURI } = require('./config');
const router = require('./routes')

const config = require("./config");

connectMongoDB();
app.use(
  cors({
    origin: frontendURI, // 출처 허용 옵션
    credentials: true, // 사용자 인증이 필요한 리소스(쿠키 등) 접근
  }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


//^ 백엔드 테스트시 아래 주석 해제
// app.use(express.static('public'));
// app.get('/auth/kakao', (req, res) => {
//   res.redirect(config.kakaoAuthURI);
// });

app.use("/api", router);

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.json({ message: err.message })
});

app
  .listen(port,
    console.log(`
############################
#     Server is start!     #
############################`))
  .on("error", () => {
    console.error('error');
    process.exit(1);
  })
