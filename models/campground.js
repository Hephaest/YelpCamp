const mongoose = require('mongoose');
const Review = require('./review');
const Image = require('./image');
const Schema = mongoose.Schema;
const Model = mongoose.model;

const opts = {toJSON: {virtuals: true}};

const CampgroundSchema = new Schema({
  title: String,
  price: Number,
  images: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Image',
    },
  ],
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
  rating: {
    type: Number,
    default: 0,
  },
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
  return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p
    `;
});

CampgroundSchema.virtual('truncateDescText').get(function() {
  return this.description.split('').splice(0, 160).join('') + ' ...';
});

CampgroundSchema.post('findOneAndDelete', async (doc) => {
  if (doc) {
    await Review.deleteMany({_id: {$in: doc.reviews}});
    await Image.deleteMany({_id: {$in: doc.images}});
  }
});

module.exports = Model('Campground', CampgroundSchema);
