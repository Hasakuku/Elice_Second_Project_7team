const { Base, } = require('../models');
const { NotFoundError, InternalServerError, ConflictError, BadRequestError } = require('../utils/customError');
const fs = require('fs');
const path = require('path');

const baseService = {
   //* 베이스 목록 조회
   async getBaseList() {
      const baseList = await Base.find({}).select('_id name image').lean();
      return baseList;
   },
   //* 베이스 등록
   async createBase(data) {
      const { name, } = data;
      const foundBase = await Base.findOne({ name: name }).lean();
      if (foundBase) throw new ConflictError('이미 등록된 Base');
      let image;
      if (data.newImageNames) { image = data.newImageNames[0].imageName; }
      const newBase = new Base({ name, image, });
      const result = await newBase.save();
      if (!result) throw new InternalServerError('등록 안됨');
   },
   //* 베이스 수정
   async updateBase(baseId, data) {
      const { name, } = data;
      const foundBase = await Base.findById(baseId).lean();
      if (!foundBase) throw new NotFoundError('Base 정보 없음');


      const dataKeys = Object.keys(data);
      const isSame = dataKeys.map(key => foundBase[key] === data[key]).some(value => value === true);
      let image;
      if (data.newImageNames) {
         const imagePath = path.join(__dirname, '../images', foundBase.image);
         fs.unlink(imagePath, (err) => {
            if (err) throw new InternalServerError('이미지 삭제 실패');
         });
         image = data.newImageNames[0].imageName;
      }

      if (isSame) {
         throw new ConflictError('같은 내용 수정');
      }
      const updateBase = await Base.updateOne(
         { _id: baseId },
         { name, image, },
         { runValidators: true }
      );
      if (updateBase.modifiedCount === 0) throw new InternalServerError('칵테일 수정 실패');
   },
   //* 베이스 삭제
   async deleteBase(baseId) {
      const foundBase = await Base.findById(baseId).lean();
      if (!foundBase) throw new NotFoundError('Base 정보 없음');
      // 이미지 파일 삭제
      const imagePath = path.join(__dirname, '../images', foundBase.image);
      fs.unlink(imagePath, (err) => {
         if (err) throw new InternalServerError('이미지 삭제 실패');
      });

      const result = await Base.deleteOne({ _id: baseId });
      if (result.deletedCount === 0) throw new InternalServerError("Base 삭제 실패");
   },
};

module.exports = baseService;