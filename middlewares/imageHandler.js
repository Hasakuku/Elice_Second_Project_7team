const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const upload = multer({ dest: 'images/' });
const asyncHandler = require('express-async-handler');

// 이미지 업로드 미들웨어
const uploadImage = upload.fields([{ name: 'images', maxCount: 10 }, { name: 'recipeImages', maxCount: 10 }]);

// 이미지 업로드 핸들러
// const imageHandler = asyncHandler(async (req, res, next) => {

//    const filenames = await Promise.all(req.files.map(async file => {
//       const newFileName = file.originalname.split('.')[0] + '_' + 1000 * Math.random().toFixed(3) + Date.now() + path.extname(file.originalname);
//       const newFilePath = path.join('images/', newFileName);
//       await fs.rename(file.path, newFilePath);

//       return { imageName: newFileName };
//    }));
//    req.body.newImageNames = filenames;
//    const images = filenames.filter(filename => filename.fieldname === 'images');
//    const recipeImages = filenames.filter(filename => filename.fieldname === 'recipeImage');

//    req.body.newImageNames = images;
//    req.body.recipeImageNames = recipeImages;
//    next();
// });
// 이미지 업로드 핸들러
const imageHandler = asyncHandler(async (req, res, next) => {
   let filenames = [];
   let recipeImages = [];
   if (req.files.images) {
      filenames = await Promise.all(req.files.images.map(async file => {
         const newFileName = file.originalname.split('.')[0] + '_' + 1000 * Math.random().toFixed(3) + Date.now() + path.extname(file.originalname);
         const newFilePath = path.join('images/', newFileName);
         await fs.rename(file.path, newFilePath);

         return { imageName: `/images/${newFileName}` };
      }));
   }
   if (req.files.recipeImages) {
      recipeImages = await Promise.all(req.files.recipeImages.map(async file => {
         const newFileName = file.originalname.split('.')[0] + '_' + 1000 * Math.random().toFixed(3) + Date.now() + path.extname(file.originalname);
         const newFilePath = path.join('images/', newFileName);
         await fs.rename(file.path, newFilePath);

         return { imageName: `/images/${newFileName}` };
      }));
   }
   req.body.newImageNames = filenames;
   req.body.recipeImageNames = recipeImages;
   next();
});


module.exports = { uploadImage, imageHandler };