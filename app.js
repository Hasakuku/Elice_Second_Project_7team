const express = require('express');
const app = express();
const cors = require('express')
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const mongoDB = require('./db')
const { port, frontendURI } = require('./config');
const router = require('./routes')

mongoDB();

app.use(
  cors({
    origin: frontendURI, // 출처 허용 옵션
    credentials: true, // 사용자 인증이 필요한 리소스(쿠키 등) 접근
  }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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
