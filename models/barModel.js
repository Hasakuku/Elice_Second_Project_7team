const mongoose = require('mongoose');
const { Schema } = mongoose;

//칵테일 바
const BarSchema = new Schema({
   name: { type: String, required: true, },
   images: { type: String, required: true, },
   address: { type: String, required: true },
   operationTime: { type: String, required: true },
   map: {
      x: Number,
      y: Number
   },
}, {
   versionKey: false
})

const Bar = mongoose.model('Bar', BarSchema);
module.exports = Bar;