const express = require('express');
const router = express.Router();

const userRouter = require('./userRouter');
const cocktailRouter = require('./cocktailRouter');
const diyRecipeRouter = require('./diyRecipeRouter');
const kakaoRouter = require('./kakaoRouter');
const searchRouter = require('./searchRouter');
const barRouter = require('./barRouter');
const baseRouter = require('./baseRouter');
const reviewRouter = require('./reviewRouter');

router.use('/search', searchRouter);
router.use('/auth', kakaoRouter);

router.use('/reviews', reviewRouter);
router.use('/bases', baseRouter);
router.use('/bars', barRouter);
router.use('/users', userRouter);
router.use('/cocktails', cocktailRouter);
router.use('/diy-recipes', diyRecipeRouter);

module.exports = router;
