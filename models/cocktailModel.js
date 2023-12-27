const mongoose = require('mongoose');
const { Schema } = mongoose;

//칵테일
const CocktailSchema = new Schema({
   name: { type: String, required: true, },
   base: { type: mongoose.Schema.Types.ObjectId, ref: 'Base', required: true, },
   image: { type: String },
   description: { type: String },
   ingredient: { type: String, required: true }, // 재료
   tags: [{ type: String }],
   recipes: [{
      image: { type: String },
      content: { type: String }
   }],
   abv: { type: Number, min: 1, max: 5, required: true }, // 도수
   sweet: { type: Number, min: 1, max: 5, required: true, }, // 당도
   bitter: { type: Number, min: 1, max: 5, required: true, }, //쓴맛
   sour: { type: Number, min: 1, max: 5, required: true, }, // 신맛
   reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CocktailReview', }],
   wishes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', }],
   avgRating: { type: Number, default: 0 },
   reviewCount: { type: Number, default: 0 }
}, {
   timestamps: true, versionKey: false
});

const Cocktail = mongoose.model('Cocktail', CocktailSchema);
module.exports = Cocktail;