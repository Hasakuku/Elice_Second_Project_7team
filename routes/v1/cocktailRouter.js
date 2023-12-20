const express = require('express')
const router = express.Router()
const cocktailController = require('../../controllers/cocktailController')

router.post('/', cocktailController.createCocktail)
router.get('/:id', cocktailController.getCocktail)
router.put('/:id', cocktailController.updateCocktail)
router.delete('/:id', cocktailController.deleteCocktail)

module.exports = router
