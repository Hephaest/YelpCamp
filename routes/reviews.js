const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const controller = require('../controllers/reviews');

const { 
    validateReview, 
    validateLoggedIn,
    validateReviewAuthor
} = require('../middlewares');

router.post(
    '/', 
    validateLoggedIn, 
    validateReview, 
    catchAsync(controller.createReview)
);

router.delete(
    '/:reviewId', 
    validateLoggedIn, 
    validateReviewAuthor, 
    catchAsync(controller.deleteReview)
);

module.exports = router;