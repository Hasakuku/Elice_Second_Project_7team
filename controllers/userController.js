const asyncHandler = require('express-async-handler');
const userService = require('../services/userService');
const { BadRequestError } = require('../utils/customError');

const getUser = asyncHandler(async (req, res) => {
   const user = req.user;
   // const user = req.body;
   const result = await userService.getUser(user);
   res.status(200).json(result);
});

const updateUser = asyncHandler(async (req, res) => {
   const user = req.user;
   const { email, nickname } = req.body;
   if (!email && !nickname) throw new BadRequestError("요청 데이터 없음");

   await userService.updateUser(user, email, nickname);
   res.status(200).json('업데이트 성공');
});

const withdrawal = asyncHandler(async (req, res) => {
   const user = req.user;
   await userService.withdrawal(user);
   res.status(204).json('탈퇴 성공');
});

const getWishListByType = asyncHandler(async (req, res) => {
   // const user = req.user;
   const user = req.body;
   const type = req.query.type;
   if (!type) throw new BadRequestError("요청 타입 없음");
   const result = await userService.getWishListByType(user, type);
   res.status(200).json(result);
});

const deleteWish = asyncHandler(async (req, res) => {
   const user = req.user;
   // const user = req.body;
   const id = req.params.id;
   if (!id) throw new BadRequestError("요청 id없음");
   await userService.deleteWish(user, id);
   res.status(204).json('');
});
module.exports = { getUser, updateUser, withdrawal, getWishListByType, deleteWish };