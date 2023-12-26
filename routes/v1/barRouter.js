const express = require('express');
const router = express.Router();
const barController = require('../../controllers/barController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');
const { validateBar } = require('../../middlewares/validators');

router.get('/:id', barController.getBar);
router.get('/', barController.getBarList);
router.post('/', checkUser, checkAdmin, validateBar, barController.createBar);
router.put('/:id', checkUser, checkAdmin, validateBar, barController.updateBar);
router.delete('/:id', checkUser, checkAdmin, barController.deleteBar);

module.exports = router;
