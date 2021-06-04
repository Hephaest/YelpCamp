const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Model = mongoose.model;

const reviewSchema = new Schema({
  comment: String,
  date: {
    type: Date,
    default: Date.now,
  },
  rating: Number,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

module.exports = Model('Review', reviewSchema);
