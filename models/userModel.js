const mongoose = require('mongoose');
const { Schema } = mongoose;

//유저
const UserSchema = new Schema({
   email: { type: String, required: true },
   nickname: { type: String, },
   wishes: {
      cocktails: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cocktail', }],
      diyRecipe: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DiyRecipe', }],
   },
   isAdmin: { type: Boolean, default: false },
   isWrite: { type: Boolean, default: true },
   deletedAt: { type: Date, default: null },
}, {
   timestamps: true, versionKey: false
})

const User = mongoose.model('User', UserSchema);
module.exports = User;