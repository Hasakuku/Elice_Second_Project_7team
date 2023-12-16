const mongoose = require('mongoose');
const { Schema } = mongoose;

//칵테일
const CocktailSchema = new Schema({
   name: { type: String, required: true, },
   base: { type: mongoose.Schema.Types.ObjectId, ref: 'Base', required: true, },
   image: { type: String },
   description: { type: String },
   ingredient: { type: String, required: true }, // 재료
   tag: [{ type: String }],
   recipe: [{
      image: { type: String },
      content: { type: String }
   }],
   abv: { type: Number, min: 0, max: 100, required: true }, // 도수
   sweet: { type: Number, min: 1, max: 5, required: true, }, // 당도
   bitter: { type: Number, min: 1, max: 5, required: true, }, //쓴맛
   sour: { type: Number, min: 1, max: 5, required: true, }, // 신맛
   review: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CocktailReview', }],
   wish: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', }],
}, {
   timestamps: true, versionKey: false
})
// 칵테일 삭제전 리뷰와 유저의 위시에서 삭제
CocktailSchema.pre('remove', async function (next) {
   await this.model('CocktailReview').deleteMany({ _id: { $in: this.review } });
   await this.model('User').updateMany({ "wish.cocktails": this._id }, { $pull: { wish: this._id } });
   next();
});

const Cocktail = mongoose.model('Cocktail', CocktailSchema);
module.exports = Cocktail;