const express = require('express');
const router = express.Router();
const imageController = require('../../controllers/imageController');
const multer = require('multer');
const upload = multer({ dest: 'images/' });

router.post('/', upload.array('images' , 10), imageController.uploadImage);
router.get('/', imageController.getImages);

module.exports = router;
