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
   recipe: [{
      image: { type: String },
      content: { type: String }
   }],
   abv: { type: Number, required: true }, // 도수
   sweet: { type: Number, min: 1, max: 5, required: true, }, // 당도
   bitter: { type: Number, min: 1, max: 5, required: true, }, //쓴맛
   sour: { type: Number, min: 1, max: 5, required: true, }, // 신맛
   reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DiyRecipeReview', }],
   wishes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
}, {
   timestamps: true, versionKey: false
});
// DIY레시피 삭제전 리뷰와 유저의 위시에서 삭제
DiyRecipeSchema.pre('remove', async function (next) {
   await this.model('DiyRecipeReview').deleteMany({ _id: { $in: this.review } });
   await this.model('User').updateMany({ "wish.diyRecipe": this._id }, { $pull: { wish: this._id } });
   next();
});

const DiyRecipe = mongoose.model('DiyRecipe', DiyRecipeSchema);
module.exports = DiyRecipe;