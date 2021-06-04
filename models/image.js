const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Model = mongoose.model;

const opts = {toJSON: {virtuals: true}};

const ImageSchema = new Schema({
  url: String,
  filename: String,
}, opts);

ImageSchema.virtual('thumbnail').get(function() {
  return this.url.replace('/upload', '/upload/w_200');
});

ImageSchema.virtual('medium').get(function() {
  return this.url.replace('/upload', '/upload/w_600,h_400,c_fill');
});

ImageSchema.virtual('large').get(function() {
  return this.url.replace('/upload', '/upload/w_1000,h_400,c_fill');
});

module.exports = Model('Image', ImageSchema);
