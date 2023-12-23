const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const upload = multer({ dest: 'images/' });
const asyncHandler = require('express-async-handler');

// 이미지 업로드 미들웨어
const uploadImage = upload.array('images', 10);

// 이미지 업로드 핸들러
const imageHandler = asyncHandler(async (req, res, next) => {

   const filenames = await Promise.all(req.files.map(async file => {
      const newFileName = file.originalname.split('.')[0] + '_' + 1000 * Math.random().toFixed(3) + Date.now() + path.extname(file.originalname);
      const newFilePath = path.join('images/', newFileName);
      await fs.rename(file.path, newFilePath);

      return { imageName: newFileName };
   }));
   req.body.newImageNames = filenames;
   next();
});

module.exports = { uploadImage, imageHandler };