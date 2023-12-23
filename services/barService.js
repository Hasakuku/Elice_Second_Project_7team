const { Bar } = require('../models');
const { NotFoundError, InternalServerError, ConflictError, BadRequestError } = require('../utils/customError');

const barService = {
   //* 바 목록 조회
   async getBarList(query) {
      const { x1, x2, y1, y2 } = query;
      const data = await Bar.find({
         x: { $gt: x1, $lt: x2 },
         y: { $gt: y1, $lt: y2 },
      });
      // 수동으로 필터링
      const filteredData = data.filter((data) => data.address);
      console.log(filteredData.map((data) => data.address));
      return filteredData;
   },
   //* 바 상세 조회
   async getBar(barId) {
      const bar = await Bar.findById(barId).lean();
      if (!bar) throw new NotFoundError('바 정보 없음');
      return bar;
   },
   //* 바 등록
   async createBar(data) {
      let { name, address, time, x, y, tel } = data;
      const foundBar = await Bar.findOne({ address: address }).lean();
      if (foundBar) throw new ConflictError('이미 등록된 주소');
      const image = data.newImageNames[0].imageName;
      const newBar = new Bar({ name, image, address, x, y, time, tel });
      const result = await newBar.save();
      if (!result) throw new InternalServerError('등록 안됨');
   },
   //* 바 수정
   async updateBar(barId, data) {
      const { name, image, address, operationTime, map } = data;
      const foundBar = await Bar.findById(barId).lean();
      if (!foundBar) throw new NotFoundError('바 정보 없음');

      const dataKeys = Object.keys(data);
      const isSame = dataKeys.map(key => foundBar[key] === data[key]).every(value => value === true);

      if (isSame) {
         throw new ConflictError('같은 내용 수정');
      }
      const updateBar = await Bar.updateOne(
         { _id: barId },
         { name, image, address, operationTime, map },
         { runValidators: true }
      );
      if (updateBar.modifiedCount === 0) throw new ConflictError('바 수정 실패');
   },
   //* 바 삭제
   async deleteBar(barId) {
      const foundBar = await Bar.findById(barId).lean();
      if (!foundBar) throw new NotFoundError('바 정보 없음');

      const result = await Bar.deleteOne({ _id: barId });
      if (result.deletedCount === 0) throw new InternalServerError("바 삭제 실패");
   },
};

module.exports = barService;