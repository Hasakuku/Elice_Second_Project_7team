const { Base, } = require('../models');
const { NotFoundError, InternalServerError, ConflictError, BadRequestError } = require('../utils/customError');
const fs = require('fs').promises;
const path = require('path');
const setParameter = require('../utils/setParameter');

const baseService = {
   //* 베이스 목록 조회
   async getBaseList({ perPage, page }) {
      const { skip, limit } = setParameter(perPage, page);
      const total = await Base.countDocuments();
      const bases = await Base.find({}).select('_id name image').skip(skip).limit(limit).lean();
      return { total, bases };
   },
   //* 베이스 조회
   async getBase(id) {
      const base = await Base.findById(id).lean();
      if (!base) throw new NotFoundError('Base를 찾을 수 없음');
      return base;
   },
   //* 베이스 등록
   async createBase(data) {
      const { name, newImageNames } = data;
      const foundBase = await Base.findOne({ name: name }).lean();
      if (foundBase) throw new ConflictError('이미 등록된 Base');
      let image;
      if (newImageNames.length !== 0 && Array.isArray(newImageNames)) { image = newImageNames[0].imageName; }
      const newBase = new Base({ name, image, });
      const result = await newBase.save();
      if (!result) throw new InternalServerError('등록 안됨');
   },
   //* 베이스 수정
   async updateBase(baseId, data) {
      const { name, newImageNames } = data;
      const foundBase = await Base.findById(baseId).lean();
      if (!foundBase) throw new NotFoundError('Base 정보 없음');

      const dataKeys = Object.keys(data);
      const isSame = dataKeys.map(key => foundBase[key] === data[key]).every(value => value === true);

      if (isSame) {
         throw new ConflictError('같은 내용 수정');
      }
      let image;
      if (newImageNames.length !== 0) {
         const imagePath = path.join(__dirname, '../', foundBase.image);
         fs.unlink(imagePath, (err) => {
            if (err.code !== 'ENOENT') {
               throw new InternalServerError('이미지 삭제 실패');
            }
         });
         image = newImageNames[0].imageName;
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
      const imagePath = path.join(__dirname, '../', foundBase.image);
      await fs.unlink(imagePath).catch(err => {
         if (err.code !== 'ENOENT') {
            throw new InternalServerError('이미지 삭제 실패');
         }
      });

      const result = await Base.deleteOne({ _id: baseId });
      if (result.deletedCount === 0) throw new InternalServerError("Base 삭제 실패");
   },
};

module.exports = baseService;