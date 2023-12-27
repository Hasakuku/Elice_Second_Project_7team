const express = require('express');
const router = express.Router();
const baseController = require('../../controllers/baseController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
const { validateBase } = require('../../middlewares/validators');
const { uploadImage, imageHandler } = require('../../middlewares/imageHandler');

router.get('/:id', baseController.getBase);
router.get('/', baseController.getBaseList);
router.post('/', checkUser, checkAdmin, validateBase, uploadImage, imageHandler, baseController.createBase);
router.put('/:id', checkUser, checkAdmin, validateBase, uploadImage, imageHandler, baseController.updateBase);
router.delete('/:id', checkUser, checkAdmin, baseController.deleteBase);

module.exports = router;