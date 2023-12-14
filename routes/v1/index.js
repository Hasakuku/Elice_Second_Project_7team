const express = require('express');
const router = express.Router();

const imageRouter = require('./imageRouter')
const userRouter = require('./userRouter')
const barRouter = require('./barRouter')
const baseRouter = require('./baseRouter')
const cocktailRouter = require('./cocktailRouter')
const diyRecipeRouter = require('./diyRecipeRouter')
const reviewRouter = require('./reviewRouter')

router.use('/images', imageRouter);

// router.use('/survey', abc);
// router.use('/search', abc);

router.use('/mypage', userRouter);
router.use('/bars', barRouter);
router.use('/bases', baseRouter);
router.use('/cocktails', cocktailRouter);
router.use('/diy-recipes', diyRecipeRouter);
router.use('/reviews', reviewRouter);

module.exports = router;
