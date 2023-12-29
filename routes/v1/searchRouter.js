const express = require('express');
const router = express.Router();
const searchController = require('../../controllers/searchController');
const { validator, search } = require('../../middlewares/validators');

router.get('/auto-complete', //* 자동 완성 목록
   validator(search.validationKeywordAutoCompletion),
   searchController.keywordAutoCompletion
);
router.get('/admin', //* 검색(관리자)
   validator(search.validationSearchForAdmin),
   searchController.searchForAdmin
);
router.get('/', //* 검색
   validator(search.validationSearchByKeyword),
   searchController.searchByKeyword
);

module.exports = router;
