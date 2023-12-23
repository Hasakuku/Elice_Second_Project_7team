const asyncHandler = require('express-async-handler');
const baseService = require('../services/baseService');
const { BadRequestError } = require('../utils/customError');
//* 베이스 목록 조회
const getBaseList = asyncHandler(async (req, res) => {
   const { item, page } = req.query;
   const result = await baseService.getBaseList(item, page);
   res.status(200).json(result);
});
//* 베이스 등록
const createBase = asyncHandler(async (req, res) => {
   await baseService.createBase(req.body);
   res.status(201).json({ message: 'Base 등록 성공' });
});
//* 베이스 수정
const updateBase = asyncHandler(async (req, res) => {
   const barId = req.params.id;
   await baseService.updateBase(barId, req.body);
   res.status(200).json({ message: 'Base 수정 성공' });
});
//* 베이스 삭제
const deleteBase = asyncHandler(async (req, res) => {
   const barId = req.params.id;
   await baseService.deleteBase(barId);
   res.status(204).json({ message: 'Base 삭제 성공' });
});

module.exports = { getBaseList, createBase, updateBase, deleteBase };