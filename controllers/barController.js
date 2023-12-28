const asyncHandler = require('express-async-handler');
const barService = require('../services/barService');
const { BadRequestError } = require('../utils/customError');
//* 바 목록 조회
const getBarList = asyncHandler(async (req, res) => {
   const { x1, x2, y1, y2, keyword, perPage, page } = req.query;
   const result = await barService.getBarList({ x1, x2, y1, y2, keyword, perPage, page });
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
   const { name, address, time, x, y, tel, newImageNames } = req.body;
   await barService.createBar({ name, address, time, x, y, tel, newImageNames });
   res.status(201).json({ message: 'bar 등록 성공' });
});
//* 바 수정
const updateBar = asyncHandler(async (req, res) => {
   const barId = req.params.id;
   const { name, address, time, tel, x, y, newImageNames } = req.body;
   await barService.updateBar(barId, { name, address, time, tel, x, y, newImageNames });
   res.status(200).json({ message: 'bar 수정 성공' });
});
//* 바 삭제
const deleteBar = asyncHandler(async (req, res) => {
   const barId = req.params.id;
   await barService.deleteBar(barId);
   res.status(204).json({ message: 'bar 삭제 성공' });
});

module.exports = { getBarList, getBar, createBar, updateBar, deleteBar };