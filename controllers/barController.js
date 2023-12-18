const asyncHandler = require('express-async-handler');
const barService = require('../services/barService');
const { BadRequestError } = require('../utils/customError');
//* 바 목록 조회
const getBarList = asyncHandler(async (req, res) => {
   const { item, page } = req.query;
   const result = await barService.getBarList(item, page);
   res.status(200).json(result);
});
//* 바 상세 조회
const getBar = asyncHandler(async (req, res) => {
   const barId = req.params.id;
   const result = await barService.getBar(barId);
   res.status(200).json(result);
});
//* 바 등록
const createBar = asyncHandler(async (req, res) => {
   await barService.createBar(req.body);
   res.status(201).json({ message: 'bar 등록 성공' });
});
//* 바 수정
const updateBar = asyncHandler(async (req, res) => {
   const barId = req.params.id;
   await barService.updateBar(barId, req.body);
   res.status(200).json({ message: 'bar 수정 성공' });
});
//* 바 삭제
const deleteBar = asyncHandler(async (req, res) => {
   const barId = req.params.id;
   await barService.deleteBar(barId);
   res.status(204).json({ message: 'bar 삭제 성공' });
});

module.exports = { getBarList, getBar, createBar, updateBar, deleteBar };