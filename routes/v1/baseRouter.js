const express = require('express');
const router = express.Router();
const baseController = require('../../controllers/baseController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
// const { validateBase } = require('../../middlewares/validators');
const { uploadImage, imageHandler } = require('../../middlewares/imageHandler');
const { validationPutBase, validationPostBase } = require('../../middlewares/validators/base');

router.get('/:id', baseController.getBase);
router.get('/', baseController.getBaseList);
router.post('/', checkUser, checkAdmin,  uploadImage, imageHandler, validationPostBase, baseController.createBase);
router.put('/:id', checkUser, checkAdmin,  uploadImage, imageHandler, validationPutBase, baseController.updateBase);
router.delete('/:id', checkUser, checkAdmin, baseController.deleteBase);

module.exports = router;