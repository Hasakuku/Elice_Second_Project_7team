const fs = require('fs').promises;
const path = require('path');
const mime = require('mime-types');

//* 이미지 업로드
const uploadImage = async (file) => {
   const newFileName = Date.now() + path.extname(file.originalname);
   const newFilePath = path.join('images/', newFileName);
   await fs.rename(file.path, newFilePath);
   return { originalName: newFileName };
};
//* 이미지 조회
const getImages = async (filename) => {
   const filePath = path.join('images/', filename);
   const data = await fs.readFile(filePath);
   const contentType = mime.contentType(path.extname(filename));
   return { data: data.toString('base64'), contentType }; // 데이터를 base64 형태로 변환
};

module.exports = { uploadImage, getImages };