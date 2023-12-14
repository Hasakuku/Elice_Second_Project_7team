const express = require('express');
const userController = require('../../controllers/userController');
const permission = require('../../middlewares/permission');
const router = express.Router();

router.get('/', permission('user'), userController.getUser)
router.put('/', permission('user'), userController.updateUser)
router.delete('/', permission('user'), userController.withdrawal)

module.exports = router;
