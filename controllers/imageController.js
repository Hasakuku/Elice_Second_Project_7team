const imageService = require('../services/imageService');
const asyncHandler = require('express-async-handler');

//* 이미지 업로드
const uploadImage = asyncHandler(async (req, res) => {
   const filenames = await Promise.all(req.files.map(file => imageService.uploadImage(file)));
   res.status(201).json(filenames);
});

//* 이미지 조회 
const getImages = async (req, res) => {
   const filenames = req.query.filenames.split(','); // 파일 이름들을 배열로 변환
   const images = await Promise.all(filenames.map(filename => imageService.getImages(filename))); // 각 이미지를 병렬로 조회
   res.set('Content-Type', 'application/json');
   res.send(images); // 이미지 데이터를 JSON 형태로 전송
};

module.exports = { uploadImage, getImages };