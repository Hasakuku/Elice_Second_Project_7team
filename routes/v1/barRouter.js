const express = require('express');
const router = express.Router();
const barController = require('../../controllers/barController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
const { uploadImage, imageHandler } = require('../../middlewares/imageHandler');

router.get('/:id', barController.getBar);
router.get('/', barController.getBarList);
router.post('/', checkUser, checkAdmin, uploadImage, imageHandler, barController.createBar);
router.put('/:id', checkUser, checkAdmin, uploadImage, imageHandler, barController.updateBar);
router.delete('/:id', checkUser, checkAdmin, barController.deleteBar);

module.exports = router;
