const v1 = require("./v1");
const express = require('express');
const router = express.Router();

router.use('/v1', v1);

module.exports = router;
