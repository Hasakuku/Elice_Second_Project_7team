const mongoose = require('mongoose');
const { Schema } = mongoose;

// DIY 레시피
const DiyRecipeSchema = new Schema({
   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, },
   base: { type: mongoose.Schema.Types.ObjectId, ref: 'Base', required: true, },
   name: { type: String, required: true, },
   image: { type: String },
   description: { type: String },
   ingredient: { type: String, required: true, },
   tags: [{ type: String }],
   recipes: [{
      image: { type: String },
      content: { type: String }
   }],
   abv: { type: Number, min: 1, max: 5, required: true  }, // 도수
   sweet: { type: Number, min: 1, max: 5, required: true, }, // 당도
   bitter: { type: Number, min: 1, max: 5, required: true, }, //쓴맛
   sour: { type: Number, min: 1, max: 5, required: true, }, // 신맛
   reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DiyRecipeReview', }],
   wishes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
   avgRating: { type: Number, default: 0 },
   reviewCount: { type: Number, default: 0 }
}, {
   timestamps: true, versionKey: false
});

const DiyRecipe = mongoose.model('DiyRecipe', DiyRecipeSchema);
module.exports = DiyRecipe;