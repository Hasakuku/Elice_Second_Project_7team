const imageService = require('../services/imageService');
const asyncHandler = require('express-async-handler');

//* 이미지 업로드
exports.uploadImage = asyncHandler(async (req, res) => {
   const filename = await imageService.uploadImage(req.file);
   res.status(200).json(filename);
});

//* 이미지 조회
exports.getImage = async (req, res) => {
   const image = await imageService.getImage(req.params.filename);
   res.set('Content-Type', image.contentType);
   res.send(image.data);
};