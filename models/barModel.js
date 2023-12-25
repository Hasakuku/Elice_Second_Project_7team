const mongoose = require('mongoose');
const { Schema } = mongoose;

//칵테일 바
const BarSchema = new Schema({
   name: { type: String, required: true, },
   image: { type: String, },
   address: { type: String, required: true, unique: true },
   tel: { type: String, },
   time: { type: String, required: true },
   x: Number,
   y: Number
}, {
   versionKey: false
});

const Bar = mongoose.model('Bar', BarSchema);
module.exports = Bar;