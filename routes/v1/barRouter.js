const express = require('express');
const router = express.Router();
const barController = require('../../controllers/barController');

router.get('/:id',barController.getBar);
router.get('/', barController.getBarList);
router.post('/', barController.createBar);
router.put('/:id', barController.updateBar);
router.delete('/:id', barController.deleteBar);

module.exports = router;
