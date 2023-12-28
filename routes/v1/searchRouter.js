const express = require('express');
const router = express.Router();
const searchController = require('../../controllers/searchController');

router.get('/auto', searchController.keywordAutoCompletion);
router.get('/admin', searchController.searchForAdmin);
router.get('/', searchController.searchByKeyword);

module.exports = router;
