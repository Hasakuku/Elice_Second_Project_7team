const express = require('express');
const router = express.Router();
const barController = require('../../controllers/barController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
// const { validateBar } = require('../../middlewares/validators');
const { uploadImage, imageHandler } = require('../../middlewares/imageHandler');
const { validationGetBars, validationPostBars, validationPutBars } = require('../../middlewares/validators/bar');

router.get('/:id', validationGetBars, barController.getBar);
router.get('/', validationGetBars, barController.getBarList);
router.post('/', checkUser, checkAdmin,  uploadImage, imageHandler, validationPostBars, barController.createBar);
router.put('/:id', checkUser, checkAdmin,  uploadImage, imageHandler, validationPutBars, barController.updateBar);
router.delete('/:id', checkUser, checkAdmin, barController.deleteBar);

module.exports = router;
