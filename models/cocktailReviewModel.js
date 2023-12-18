const mongoose = require('mongoose');
const { Schema } = mongoose;

//칵테일 리뷰
const CocktailReviewSchema = new Schema({
   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   cocktail: { type: mongoose.Schema.Types.ObjectId, ref: 'Cocktail', required: true },
   content: { type: String, required: true, },
   images: [{ type: String, }],
   rating: { type: Number, required: true, },
   likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
}, {
   timestamps: true, versionKey: false
});

const CocktailReview = mongoose.model('CocktailReview', CocktailReviewSchema);
module.exports = CocktailReview;