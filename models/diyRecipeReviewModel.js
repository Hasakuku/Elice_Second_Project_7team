const mongoose = require('mongoose');
const { Schema } = mongoose;

//레시피 리뷰
const DiyRecipeReviewSchema = new Schema({
   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   diyRecipe: { type: mongoose.Schema.Types.ObjectId, ref: 'DiyRecipe', required: true },
   content: { type: String, required: true, },
   images: [{ type: String, }],
   rating: { type: Number, required: true, },
   likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
}, {
   timestamps: true, versionKey: false
});
DiyRecipeReviewSchema.post('save', async function () {
   const review = this;
   const DiyRecipe = mongoose.model('DiyRecipe');
   const diyRecipe = await DiyRecipe.findById(review.diyRecipe);
   if (diyRecipe) {
      diyRecipe.reviews.push(review._id);
      await diyRecipe.save();
   }
});
const DiyRecipeReview = mongoose.model("DiyRecipeReview", DiyRecipeReviewSchema);
module.exports = DiyRecipeReview;