const express = require('express');
const router = express.Router();
const searchController = require('../../controllers/searchController');
const { validationGetSearch } = require('../../middlewares/validators/search');

router.get('/admin', validationGetSearch, searchController.searchForAdmin);
router.get('/', validationGetSearch, searchController.searchByKeyword);

module.exports = router;
