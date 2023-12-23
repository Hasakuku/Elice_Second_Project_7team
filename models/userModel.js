const mongoose = require('mongoose');
const { Schema } = mongoose;

//유저
const UserSchema = new Schema({
   kakaoId: { type: Number, unique: true },
   email: { type: String, required: true, unique: true },
   nickname: { type: String, },
   custom: {
      abv: Number, sweet: Number, sour: Number, bitter: Number,
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