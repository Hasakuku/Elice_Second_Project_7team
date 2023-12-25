const asyncHandler = require('express-async-handler');
const reviewService = require('../services/reviewService');

//* 리뷰 검색(관리자)
const getReviewListByKeyword = asyncHandler(async (req, res) => {
   const { keyword, type, perPage, page } = req.query;
   const result = await reviewService.getReviewListByKeyword({ keyword, type, perPage, page });
   res.status(200).json(result);
});
//* 리뷰 삭제(관리자)
const deleteReview = asyncHandler(async (req, res) => {
   const id = req.params.id;
   await reviewService.deleteReview(id);
   res.status(204).json("");
});
//* 유저 리뷰 목록 조회
const getUserReviewList = asyncHandler(async (req, res) => {
   const userId = req.user._id;
   const { cursorId, type, perPage, page } = req.query;
   const result = await reviewService.getUserReviewList(userId, { cursorId, type, perPage, page });
   res.status(200).json(result);
});
//* 리뷰 목록 조회
const getReviewList = asyncHandler(async (req, res) => {
   // const id = req.params.id;
   const { item, page, id } = req.query;
   const result = await reviewService.getReviewList(id, item, page);
   res.status(200).json(result);
});
//* 리뷰 등록
const createReview = asyncHandler(async (req, res) => {
   const userId = req.user._id;
   const itemId = req.params.id;
   const type = req.query.type;
   const data = req.body;
   await reviewService.createReview(userId, itemId, type, data);
   res.status(201).json({ message: '리뷰 등록 성공' });
});
//* 리뷰 상세 조회
const getReview = asyncHandler(async (req, res) => {
   const userId = req.user._id;
   const id = req.params.id;
   const result = await reviewService.getReview(userId, id);
   res.status(200).json(result);
});
//* 리뷰 수정
const updateReview = asyncHandler(async (req, res) => {
   const userId = req.user._id;
   const id = req.params.id;
   const type = req.query.type;
   const data = req.body;
   await reviewService.updateReview(userId, id, type, data);
   res.status(200).json({ message: '리뷰 수정 성공' });
});
//* 리뷰 삭제
const deleteUserReview = asyncHandler(async (req, res) => {
   const userId = req.user._id;
   const id = req.params.id;
   await reviewService.deleteUserReview(userId, id);
   res.status(204).json("");
});

//* 좋아요 추가
const addLike = asyncHandler(async (req, res) => {
   const id = req.params.id;
   const userId = req.user._id;
   await reviewService.addLike(userId, id);
   res.status(201).json({ message: '좋아요 추가 성공' });
});
//* 좋아요 삭제
const deleteLike = asyncHandler(async (req, res) => {
   const id = req.params.id;
   const userId = req.user._id;
   await reviewService.deleteLike(userId, id);
   res.status(204).json({ message: '좋아요 삭제 성공' });
});
module.exports = {
   getReviewListByKeyword,
   deleteReview,
   getReview,
   getUserReviewList,
   getReviewList,
   updateReview,
   createReview,
   deleteUserReview,
   addLike,
   deleteLike
};