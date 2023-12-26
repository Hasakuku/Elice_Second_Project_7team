const express = require('express');
const router = express.Router();
const baseController = require('../../controllers/baseController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
const { validateBase } = require('../../middlewares/validators');

router.get('/', baseController.getBaseList);
router.post('/', checkUser, checkAdmin, validateBase, baseController.createBase);
router.put('/:id', checkUser, checkAdmin, validateBase, baseController.updateBase); 
router.delete('/:id', checkUser, checkAdmin, baseController.deleteBase); 

module.exports = router;