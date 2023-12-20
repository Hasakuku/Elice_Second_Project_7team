const express = require('express');
const router = express.Router();
const searchController = require('../../controllers/searchController');

router.get('/counts', searchController.countByKeyword);
router.get('/', searchController.searchByKeyword);

module.exports = router;
