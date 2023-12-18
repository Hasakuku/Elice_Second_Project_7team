const express = require('express');
const router = express.Router();
const baseController = require('../../controllers/baseController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');

router.get('/', baseController.getBaseList);
router.post('/',checkUser, checkAdmin, baseController.createBase);
router.put('/:id',checkUser, checkAdmin, baseController.updateBase);
router.delete('/:id', checkUser, checkAdmin, baseController.deleteBase);

module.exports = router;