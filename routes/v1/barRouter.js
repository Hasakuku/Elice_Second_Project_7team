const express = require('express');
const router = express.Router();
const barController = require('../../controllers/barController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
// const { validateBar } = require('../../middlewares/validators');
const { uploadImage, imageHandler } = require('../../middlewares/imageHandler');
const { validationGetBars, validationPostBars, validationPutBars } = require('../../middlewares/validators/bar');

router.get('/:id',  barController.getBar);
router.get('/',  barController.getBarList);
router.post('/', checkUser, checkAdmin,  uploadImage, imageHandler,  barController.createBar);
router.put('/:id', checkUser, checkAdmin,  uploadImage, imageHandler,  barController.updateBar);
router.delete('/:id', checkUser, checkAdmin, barController.deleteBar);

module.exports = router;
