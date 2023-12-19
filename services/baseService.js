const Base = require('../models/baseModel');
const { NotFoundError, InternalServerError, ConflictError, BadRequestError } = require('../utils/customError');

const baseService = {
   //* 바 목록 조회
   async getBaseList() {
      const baseList = await Base.find({}).select('_id name image').lean();
      if (baseList.length === 0) throw new NotFoundError('Base 정보 없음');
      return baseList;
   },
   //* 바 등록
   async createBase(data) {
      const { name, image, } = data;
      const foundBase = await Base.findOne({ name: name }).lean();
      if (foundBase) throw new ConflictError('이미 등록된 Base');

      const newBase = new Base({ name, image, });
      const result = await newBase.save();
      if (!result) throw new InternalServerError('등록 안됨');
   },
   //* 바 수정
   async updateBase(baseId, data) {
      const { name, image, } = data;
      const foundBase = await Base.findById(baseId).lean();
      if (!foundBase) throw new NotFoundError('Base 정보 없음');
      const updateBase = await Base.updateOne(
         { _id: baseId },
         { name, image, },
         { runValidators: true }
      );
      if (!foundBase.acknowledged) throw new BadRequestError('Base 요청 데이터 오류');
      if (updateBase.modifiedCount === 0) throw new ConflictError('Base 수정 실패');
   },
   //* 바 삭제
   async deleteBase(baseId) {
      const foundBase = await Base.findById(baseId).lean();
      if (!foundBase) throw new NotFoundError('Base 정보 없음');

      const result = await Base.deleteOne({ _id: baseId });
      if (result.deletedCount === 0) throw new InternalServerError("Base 삭제 실패");
   },
};

module.exports = baseService;