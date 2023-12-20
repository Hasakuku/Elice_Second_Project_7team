const Cocktail = require('../models/cocktailModel')

const createCocktail = async (cocktailData) => {
  try {
    const cocktail = new Cocktail(cocktailData)
    return await cocktail.save()
  } catch (err) {
    throw new Error('칵테일을 생성하는 데 실패했습니다.')
  }
}

const getCocktail = async (id) => {
  try {
    const cocktail = await Cocktail.find({})
    if (!cocktail) {
      throw new Error('칵테일을 찾을 수 없습니다!')
    }
    return cocktail
  } catch (err) {
    throw new Error('칵테일을 조회하는 데 실패했습니다.')
  }
}

const updateCocktail = async (id, cocktailData) => {
  try {
    const updatedCocktail = await Cocktail.findByIdAndUpdate(id, cocktailData, {
      new: true,
    })
    if (!updatedCocktail) {
      throw new Error('칵테일을 찾을 수 없습니다!')
    }
    return updatedCocktail
  } catch (err) {
    throw new Error('칵테일을 수정하는 데 실패했습니다.')
  }
}

const deleteCocktail = async (id) => {
  try {
    const deletedCocktail = await Cocktail.findByIdAndRemove(id)
    if (!deletedCocktail) {
      throw new Error('칵테일을 찾을 수 없습니다!')
    }
    return deletedCocktail
  } catch (err) {
    throw new Error('칵테일을 삭제하는 데 실패했습니다.')
  }
}

module.exports = {
  createCocktail,
  getCocktail,
  updateCocktail,
  deleteCocktail,
}
