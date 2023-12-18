const Bar = require('../models/barModel');
const { NotFoundError, InternalServerError, ConflictError, BadRequestError } = require('../utils/customError');

const barService = {
   //* 바 목록 조회
   async getBarList(item, page) {
      //페이지당 아이템 수
      const limit = item === undefined || item === null ? 10 : item;
      const skip = page ? (page - 1) * limit : 0;

      const barList = await Bar.find({}).select('_id name image').skip(skip).limit(limit).lean();
      if (barList.length === 0) throw new NotFoundError('bar 정보 없음');
      return barList;
   },
   //* 바 상세 조회
   async getBar(barId) {
      const bar = await Bar.findById(barId).lean();
      if (!bar) throw new NotFoundError('bar 정보 없음');
      return bar;
   },
   //* 바 등록
   async createBar(data) {
      const { name, image, address, operationTime, map } = data;
      const foundBar = await Bar.findOne({ address: address }).lean();
      if (foundBar) throw new ConflictError('이미 등록된 주소');

      const newBar = new Bar({ name, image, address, operationTime, map });
      const result = await newBar.save();
      if (!result) throw new InternalServerError('등록 안됨');
   },
   //* 바 수정
   async updateBar(barId, data) {
      const { name, image, address, operationTime, map } = data;
      const foundBar = await Bar.findById(barId).lean();
      if (!foundBar) throw new NotFoundError('bar 정보 없음');
      const updateBar = await Bar.updateOne(
         { _id: barId },
         { name, image, address, operationTime, map },
         { runValidators: true }
      );
      if(!foundBar.acknowledged) throw new BadRequestError('bar 요청 데이터 오류');
      if (updateBar.modifiedCount === 0) throw new ConflictError('bar 수정 실패');
   },
   //* 바 삭제
   async deleteBar(barId) {
      const foundBar = await Bar.findById(barId).lean();
      if (!foundBar) throw new NotFoundError('bar 정보 없음');

      const result = await Bar.deleteOne({ _id: barId });
      if (result.deletedCount === 0) throw new InternalServerError("바 삭제 실패");
   },
};

module.exports = barService;