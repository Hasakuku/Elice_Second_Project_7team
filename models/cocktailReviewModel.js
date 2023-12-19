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
CocktailReviewSchema.post('save', async function() {
   const review = this;
   const Cocktail = mongoose.model('Cocktail');
   const cocktail = await Cocktail.findById(review.cocktail);
   if (cocktail) {
       cocktail.reviews.push(review._id);
       await cocktail.save();
   }
});
CocktailReviewSchema.post('remove', async function() {
   const review = this;
   const Cocktail = mongoose.model('Cocktail');
   const cocktail = await Cocktail.findById(review.cocktail);
   if (cocktail) {
       const index = cocktail.reviews.indexOf(review._id);
       if (index > -1) {
           cocktail.reviews.splice(index, 1);
           await cocktail.save();
       }
   }
});
const CocktailReview = mongoose.model('CocktailReview', CocktailReviewSchema);
module.exports = CocktailReview;