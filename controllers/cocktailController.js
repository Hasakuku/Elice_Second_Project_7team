const cocktailService = require('../services/cocktailService')

const createCocktail = async (req, res) => {
  try {
    const savedCocktail = await cocktailService.createCocktail(req.body)
    res.status(201).json(savedCocktail)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getCocktail = async (req, res) => {
  try {
    const cocktail = await cocktailService.getCocktail(req.params.id)
    if (!cocktail) {
      return res.status(404).json({ message: '칵테일을 찾을 수 없습니다!' })
    }
    res.status(200).json(cocktail)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const updateCocktail = async (req, res) => {
  try {
    const updatedCocktail = await cocktailService.updateCocktail(
      req.params.id,
      req.body,
    )
    if (!updatedCocktail) {
      return res.status(404).json({ message: '칵테일을 찾을 수 없습니다!' })
    }
    res.status(200).json(updatedCocktail)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const deleteCocktail = async (req, res) => {
  try {
    const deletedCocktail = await cocktailService.deleteCocktail(req.params.id)
    if (!deletedCocktail) {
      return res.status(404).json({ message: '칵테일을 찾을 수 없습니다!' })
    }
    res.status(204).json({ message: '해당 칵테일 정보를 삭제했습니다.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
  createCocktail,
  getCocktail,
  updateCocktail,
  deleteCocktail,
}
