const asyncHandler = require('express-async-handler');
const userService = require('../services/userService');
const { BadRequestError, NotFoundError } = require('../utils/customError');
//* 사용자 커스텀 설정
const updateUserCustom = asyncHandler(async (req, res) => {
   const userId = req.user._id;
   const { base, abv, taste, level } = req.body;
   await userService.updateUserCustom(userId, { base, abv, taste, level });
   res.status(200).json({ message: '커스텀 설정 성공' });
});
//* 사용자 정보 조회
const getUser = asyncHandler(async (req, res) => {
   const userId = req.user._id;
   const result = await userService.getUser(userId);
   res.status(200).json(result);
});
//* 로그아웃
const logout = asyncHandler(async (req, res) => {
   res.cookie('jwtToken', null, { maxAge: 0 });
   res.status(204).json({ message: "로그아웃 성공" });
});
//* 사용자 정보 수정
const updateUser = asyncHandler(async (req, res) => {
   const userId = req.user._id;
   const { email, nickname } = req.body;
   if (!email && !nickname) throw new BadRequestError("요청 데이터 없음");

   await userService.updateUser(userId, { email, nickname });
   res.status(200).json('업데이트 성공');
});
//* 사용자 탈퇴
const withdrawal = asyncHandler(async (req, res) => {
   const userId = req.user._id;
   await userService.withdrawal(userId);
   res.status(204).json('탈퇴 성공');
});
//*사용자 찜 목록 조회
const getWishListByType = asyncHandler(async (req, res) => {
   const userId = req.user._id;
   const { cursorId, page, perPage, type } = req.query;
   const result = await userService.getWishListByType(userId, { cursorId, page, perPage, type });
   res.status(200).json(result);
});
//* 사용자 찜 추가
const createWish = asyncHandler(async (req, res) => {
   const userId = req.user._id;
   const id = req.params.id;
   await userService.createWish(userId, id);
   res.status(201).json({ message: '찜 추가' });
});
//* 사용자 찜 삭제
const deleteWish = asyncHandler(async (req, res) => {
   const userId = req.user._id;
   const id = req.params.id;
   await userService.deleteWish(userId, id);
   res.status(204).json('');
});
//* 사용자 권한 수정(관리자)
const updateUserPermission = asyncHandler(async (req, res) => {
   const userId = req.params.id;
   await userService.updateUserPermission(userId);
   res.status(200).json({ message: '권한 수정 성공' });
});
//* 사용자 목록 조회(관리자)
const getUserList = asyncHandler(async (req, res) => {
   const { keyword, perPage, page } = req.query;
   const result = await userService.getUserList({ keyword, perPage, page });
   res.status(200).json(result);
});
//* 사용자 삭제(관리자)
const deleteUser = asyncHandler(async (req, res) => {
   const userId = req.params.id;
   await userService.deleteUser(userId);
   res.status(204).json('');
});
//* 기본 로그인
const login = asyncHandler(async (req, res) => {
   const { id, pw } = req.body;
   const result = await userService.login({ id, pw });
   res.cookie('jwtToken', result, { httpOnly: true });
   res.status(201).json({ message: '로그인 성공' });
});
module.exports = { getUser, logout, updateUser, withdrawal, getWishListByType, createWish, deleteWish, updateUserPermission, getUserList, deleteUser, login, updateUserCustom };