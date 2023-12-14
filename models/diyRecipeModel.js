const mongoose = require('mongoose');
const { Schema } = mongoose;

// DIY 레시피
const DiyRecipeSchema = new Schema({
   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, },
   base: { type: mongoose.Schema.Types.ObjectId, ref: 'Base', required: true, },
   name: { type: String, required: true, },
   description: { type: String },
   ingredient: { type: String, required: true, },
   images: [{ type: String, required: true, }],
   abv: { type: Number, required: true }, // 도수
   sweet: { type: Number, min: 1, max: 5, required: true, }, // 당도
   bitter: { type: Number, min: 1, max: 5, required: true, }, //쓴맛
   sour: { type: Number, min: 1, max: 5, required: true, }, // 신맛
   level: { type: Number, min: 1, max: 5, required: true, }, // 난이도
   review: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DiyRecipeReview', }],
   like: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
}, {
   timestamps: true, versionKey: false
})

const DiyRecipe = mongoose.model('DiyRecipe', DiyRecipeSchema);
module.exports = DiyRecipe;