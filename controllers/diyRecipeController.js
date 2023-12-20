const diyRecipeService = require('../services/diyRecipeService')

const createDiyRecipe = async (req, res) => {
  try {
    const savedDiyRecipe = await diyRecipeService.createDiyRecipe(req.body)
    res.status(201).json(savedDiyRecipe)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const updateDiyRecipe = async (req, res) => {
  try {
    const updatedDiyRecipe = await diyRecipeService.updateDiyRecipe(
      req.params.id,
      req.body,
    )
    if (!updatedDiyRecipe) {
      return res.status(404).json({ message: '레시피를 찾을 수 없습니다!' })
    }
    res.status(200).json(updatedDiyRecipe)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const deleteDiyRecipe = async (req, res) => {
  try {
    const deletedDiyRecipe = await diyRecipeService.deleteDiyRecipe(
      req.params.id,
    )
    if (!deletedDiyRecipe) {
      return res.status(404).json({ message: '레시피를 찾을 수 없습니다!' })
    }
    res.status(204).json({ message: '해당 DIY 레시피를 삭제했습니다.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
  createDiyRecipe,
  updateDiyRecipe,
  deleteDiyRecipe,
}
