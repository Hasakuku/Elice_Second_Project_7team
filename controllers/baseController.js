const asyncHandler = require('express-async-handler');
const barService = require('../services/barService');
const { BadRequestError } = require('../utils/customError');
//* 바 목록 조회
const getBaseList = asyncHandler(async (req, res) => {
   const { item, page } = req.query;
   const result = await barService.getBaseList(item, page);
   res.status(200).json(result);
});
//* 바 등록
const createBase = asyncHandler(async (req, res) => {
   await barService.createBase(req.body);
   res.status(201).json({ message: 'bar 등록 성공' });
});
//* 바 수정
const updateBase = asyncHandler(async (req, res) => {
   const barId = req.params.id;
   await barService.updateBase(barId, req.body);
   res.status(200).json({ message: 'bar 수정 성공' });
});
//* 바 삭제
const deleteBase = asyncHandler(async (req, res) => {
   const barId = req.params.id;
   await barService.deleteBase(barId);
   res.status(204).json({ message: 'bar 삭제 성공' });
});

module.exports = { getBaseList, createBase, updateBase, deleteBase };