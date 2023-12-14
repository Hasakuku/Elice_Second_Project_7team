const mongoose = require('mongoose');
const { Schema } = mongoose;

//칵테일
const CocktailSchema = new Schema({
   name: { type: String, required: true, },
   base: { type: mongoose.Schema.Types.ObjectId, ref: 'Base', required: true, },
   image: { type: String },
   description: { type: String },
   ingredient: { type: String, required: true }, // 재료
   recipe: { type: String, required: true },
   abv: { type: Number, required: true }, // 도수
   sweet: { type: Number, min: 1, max: 5, required: true, }, // 당도
   bitter: { type: Number, min: 1, max: 5, required: true, }, //쓴맛
   sour: { type: Number, min: 1, max: 5, required: true, }, // 신맛
   level: { type: Number, min: 1, max: 5, required: true, }, // 난이도
   review: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CocktailReview', }],
   like: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', }],
}, {
   timestamps: true, versionKey: false
})

const Cocktail = mongoose.model('Cocktail', CocktailSchema);
module.exports = Cocktail;