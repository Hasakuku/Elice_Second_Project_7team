const DiyRecipe = require('../models/diyRecipeModel')

const createDiyRecipe = async (recipeData) => {
  const diyRecipe = new DiyRecipe(recipeData)
  return await diyRecipe.save()
}

const updateDiyRecipe = async (id, recipeData) => {
  return await DiyRecipe.findByIdAndUpdate(id, recipeData, { new: true }) //validator: true
}

const deleteDiyRecipe = async (id) => {
  return await DiyRecipe.findByIdAndRemove(id)
}

module.exports = {
  createDiyRecipe,
  updateDiyRecipe,
  deleteDiyRecipe,
}
