const imageService = require('../services/imageService');
const asyncHandler = require('express-async-handler');

//* 이미지 업로드
const uploadImage = asyncHandler(async (req, res) => {
   const filenames = await Promise.all(req.files.map(file => imageService.uploadImage(file)));
   res.status(201).json(filenames);
});

module.exports = { uploadImage };