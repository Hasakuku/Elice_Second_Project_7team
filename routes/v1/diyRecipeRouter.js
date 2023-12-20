const express = require('express');
const router = express.Router();
const diyRecipeController = require('../../controllers/diyRecipeController');

router.post('/', diyRecipeController.createDiyRecipe);
router.put('/:id', diyRecipeController.updateDiyRecipe);
router.delete('/:id', diyRecipeController.deleteDiyRecipe);

module.exports = router;
