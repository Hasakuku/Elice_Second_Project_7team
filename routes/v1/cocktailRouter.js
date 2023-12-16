const express = require('express')
const router = express.Router()
const cocktailController = require('../../controllers/cocktailController')
const Cocktail = require('../../models/cocktailModel')

//개인 맞춤 추천 
router.get('/custom', cocktailController.customCocktail);
//칵테일 목록 조회
router.get('/', cocktailController.getCocktailList);
// 칵테일 등록
router.post('/', async (req, res) => {
  try {
    const cocktail = new Cocktail(req.body)
    const savedCocktail = await cocktail.save()
    res.status(204).json(savedCocktail)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

// 칵테일 정보 조회
router.get('/:id', async (req, res) => {
  try {
    const cocktail = await Cocktail.find({})
    if (!cocktail) {
      return res.status(404).json({ message: '칵테일을 찾을 수 없습니다!' })
    }
    res.status(200).json(cocktail)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

// 칵테일 수정
router.put('/:id', async (req, res) => {
  try {
    const updatedCocktail = await Cocktail.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    )
    if (!updatedCocktail) {
      return res.status(404).json({ message: '칵테일을 찾을 수 없습니다!' })
    }
    res.status(200).json(updatedCocktail)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

// 칵테일 삭제
router.delete('/:id', async (req, res) => {
  try {
    const deletedCocktail = await Cocktail.findByIdAndRemove(req.params.id)
    if (!deletedCocktail) {
      return res.status(404).json({ message: '칵테일을 찾을 수 없습니다!' })
    }
    res.status(204).json({ message: '해당 칵테일 정보를 삭제했습니다.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});


module.exports = router;
