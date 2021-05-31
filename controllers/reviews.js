const Campground = require('../models/campground');
const Review = require('../models/review');
const { successRedirect } = require('../utils/redirectHandlers');

const detailUrl = (id) => `/campgrounds/${ id }`;

const successMsg = {
    CREATE_SUCCESS: 'Successfully created the new review!',
    DELETE_SUCCESS: 'Successfully deleted the review!'
};

const calAveRating = (reviews) => {
    const len = reviews.length;
    if (!len) return 0;
    sum = reviews.map(r => r.rating).reduce((x, y) => x + y);
    return Math.ceil(sum / len);
};

const createReview = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews', 'rating');
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    campground.rating = calAveRating(campground.reviews);
    await review.save();
    await campground.save();
    successRedirect(req, res, successMsg.CREATE_SUCCESS, detailUrl(id));
};

const deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }).populate('reviews', 'rating');
    campground.rating = calAveRating(campground.reviews);
    await campground.save();
    successRedirect(req, res, successMsg.DELETE_SUCCESS, detailUrl(id));
};

module.exports = {
    createReview,
    deleteReview
};