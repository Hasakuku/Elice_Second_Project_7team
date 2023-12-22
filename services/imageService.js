const fs = require('fs').promises;
const path = require('path');
const mime = require('mime-types');

exports.uploadImage = async (file) => {
   const newFileName = Date.now() + path.extname(file.originalname);
   const newFilePath = path.join('images/', newFileName);
   await fs.rename(file.path, newFilePath);
   return { originalName: newFileName };
};

exports.getImage = async (filename) => {
   const filePath = path.join('images/', filename);
   const data = await fs.readFile(filePath);
   const contentType = mime.contentType(path.extname(filename));
   return { data, contentType };
};