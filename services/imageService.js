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

module.exports = { uploadImage };