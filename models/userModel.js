const mongoose = require('mongoose');
const { Schema } = mongoose;

//유저
const UserSchema = new Schema({
   kakaoId: { type: Number, unique: true },
   email: { type: String, required: true, unique: true },
   image: { type: String },
   nickname: { type: String, },
   profileColor: { type: String, enum: ['#B2EEFF', '#FFB6B5', '#CBEDB0', '#FFE99A', '#E4D7FF'], default: '#CBEDB0' },
   custom: {
      base: { type: String, },
      abv: { type: Number, },
      sweet: { type: Number, },
      sour: { type: Number, },
      bitter: { type: Number, },
   },
   wishes: {
      cocktails: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cocktail', }],
      diyRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DiyRecipe', }],
   },
   isAdmin: { type: Boolean, default: false },
   isWrite: { type: Boolean, default: true }, // 글 쓰기권한(리뷰작성 / DiyRecipe 작성)
   deletedAt: { type: Date, default: null },
}, {
   timestamps: true, versionKey: false
});

const User = mongoose.model('User', UserSchema);
module.exports = User;