const express = require('express');
const router = express.Router();
const imageController = require('../../controllers/imageController');
const multer = require('multer');
const upload = multer({ dest: 'images/' });

router.post('/', upload.single('image'), imageController.uploadImage);
router.get('/:filename', imageController.getImage);

module.exports = router;
