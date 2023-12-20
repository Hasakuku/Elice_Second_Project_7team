const express = require('express');
const router = express.Router();
const barController = require('../../controllers/barController');
const checkUser = require('../../middlewares/checkUser');
const checkAdmin = require('../../middlewares/checkAdmin');

router.get('/:id', barController.getBar);
router.get('/', barController.getBarList);
router.post('/', checkUser, checkAdmin, barController.createBar);
router.put('/:id', checkUser, checkAdmin, barController.updateBar);
router.delete('/:id', checkUser, checkAdmin, barController.deleteBar);

// 로그인 없이 테스트 시 해제 // checkUser, checkAdmin, 
// router.post('/', barController.createBar);
// router.put('/:id', barController.updateBar);
// router.delete('/:id', barController.deleteBar);

module.exports = router;
