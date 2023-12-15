const asyncHandler = require('express-async-handler')
const userService = require('../services/userService');
const { BadRequestError } = require('../utils/customError');

const getUser = asyncHandler(async (req, res) => {
   const user = req.user;
   const result = await userService.getUser(user);
   res.status(200).json(result)
})

const updateUser = asyncHandler(async (req, res) => {
   const user = req.user;
   const { email, nickname } = req.body;
   if (!email && !nickname) throw new BadRequestError("요청 데이터 없음")

   await userService.updateUser(user, email, nickname);
   res.status(200).json({ messsage: "성공" })
})

const withdrawal = asyncHandler(async (req, res) => {
   const user = req.user;
   await userService.withdrawal(user);
   res.status(204).json({ message: "성공" })
})
module.exports = { getUser, updateUser, withdrawal };