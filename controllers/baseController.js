const asyncHandler = require('express-async-handler');
const baseService = require('../services/baseService');
const { BadRequestError } = require('../utils/customError');
//* 베이스 목록 조회
const getBaseList = asyncHandler(async (req, res) => {
   const { perPage, page } = req.query;
   const result = await baseService.getBaseList({ perPage, page });
   res.status(200).json(result);
});
//* 베이스 상세 조회
const getBase = asyncHandler(async (req,res) => {
   const id = req.params.id;
   const result = await baseService.getBase(id);
   res.status(200).json(result);
});
//* 베이스 등록
const createBase = asyncHandler(async (req, res) => {
   const { name, newImageNames } = req.body;
   await baseService.createBase({ name, newImageNames });
   res.status(201).json({ message: 'Base 등록 성공' });
});
//* 베이스 수정
const updateBase = asyncHandler(async (req, res) => {
   const barId = req.params.id;
   const { name, newImageNames } = req.body;
   await baseService.updateBase(barId, { name, newImageNames });
   res.status(200).json({ message: 'Base 수정 성공' });
});
//* 베이스 삭제
const deleteBase = asyncHandler(async (req, res) => {
   const barId = req.params.id;
   await baseService.deleteBase(barId);
   res.status(204).json({ message: 'Base 삭제 성공' });
});

module.exports = { getBaseList, createBase, updateBase, deleteBase, getBase };