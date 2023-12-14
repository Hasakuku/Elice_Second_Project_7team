// 토큰 체크
module.exports = (role) => asyncHandler(async (req, res, next) => {
   let token;
   // const authHeader = req.headers.authorization;
   const accessToken = req.cookies.accessToken
   if (!accessToken) {
      return res.status(401).json({ message: '토큰이 없습니다.' });
   }
   // if (!authHeader) { return res.status(400).json({ message: '헤더에 토큰이 없는뎁숑?' }) }
   // if (authHeader) {
   //    token = authHeader.split(' ')[1];
   // }
   // else if (accessToken) {// 쿠키에서 토큰 추출
   //    token = accessToken;
   // }

   token = accessToken;
   const user = jwt.verify(token, secret); // 토큰 검사
   findUser = await User.findById(user.id).select('-password') // req.user에 유저 할당
   if (!findUser) {
      throw new Error('유저를 찾을 수 없습니다.')
   }
   req.user = findUser
   const isAdmin = req.user.isAdmin
   
   // 권한 유무 체크
   if (role === 'user' || role === 'admin' && isAdmin) {
      next();
   } else {
      const error = { status: 403, message: "접근이 제한되었습니다." }
      next(error);
   }
})