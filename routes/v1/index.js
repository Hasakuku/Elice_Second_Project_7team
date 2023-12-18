const express = require('express');
const router = express.Router();

const imageRouter = require('./imageRouter');
const userRouter = require('./userRouter');
const cocktailRouter = require('./cocktailRouter');
const diyRecipeRouter = require('./diyRecipeRouter');
const kakaoRouter = require('./kakaoRouter');
const searchRouter = require('./searchRouter');
const barRouter = require('./barRouter');

router.use('/search', searchRouter);
router.use('/images', imageRouter);
router.use('/auth', kakaoRouter);

router.use('/bars', barRouter);
router.use('/users', userRouter);
router.use('/cocktails', cocktailRouter);
router.use('/diy-recipes', diyRecipeRouter);

module.exports = router;
