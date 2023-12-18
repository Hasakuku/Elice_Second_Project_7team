const mongoose = require('mongoose');
const { Schema } = mongoose;

//베이스 술
const BaseSchema = new Schema({
   name: { type: String, required: true },
   image: { type: String, required: true }
}, {
   versionKey: false
});

const Base = mongoose.model('Base', BaseSchema);
module.exports = Base;