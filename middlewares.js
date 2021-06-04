const {check, validationResult} = require('express-validator');
const Campground = require('./models/campground');
const Review = require('./models/review');
const {campgroundSchema, reviewSchema} = require('./schemas');
const {failureRedirect} = require('./utils/redirectHandlers');

const validateLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // Store redirect URL
    req.session.redirectUrl = req.originalUrl;
    return failureRedirect(req, res, 'Login at first!', '/login');
  }
  next();
};

const indexUrl = '/campgrounds';
const newUrl = '/campgrounds/new';
const editUrl = (id) => `/campgrounds/${ id }/edit`;
const detailUrl = (id) => `/campgrounds/${ id }`;

const NO_PERMISSION_ERROR = 'You do not have permission to do that!';
const NO_FOUND_CAMPGROUND_ERROR = 'Cannot find that campground!';

const validateCampgroundId = async (req, res, next) => {
  const {id} = req.params;
  const result = await Campground.findById(id);
  if (!result) return failureRedirect(req, res, NO_FOUND_CAMPGROUND_ERROR, indexUrl);
  next();
};

const validateCampgroundSchema = (req, res, next) => {
  const {id} = req.params;
  const {error} = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    return failureRedirect(req, res, msg, id ? editUrl(id) : newUrl);
  }
  next();
};

const validateCampgroundAuthor = async (req, res, next) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    return failureRedirect(
        req,
        res,
        NO_PERMISSION_ERROR,
        detailUrl(id),
    );
  }
  next();
};

const validateReviewAuthor = async (req, res, next) => {
  const {id, reviewId} = req.params;
  const review = await Review.findById(reviewId);
  const isLoggedInUser = review.author.equals(req.user._id);
  if (!isLoggedInUser) return failureRedirect(req, res, NO_PERMISSION_ERROR, detailUrl(id));
  next();
};

const validateReview = (req, res, next) => {
  const {id} = req.params;
  const {error} = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    return failureRedirect(req, res, msg, detailUrl(id));
  }
  next();
};

const checkUserInput = [
  check('username')
      .isLength({min: 3})
      .withMessage('the name must have minimum length of 3')
      .trim(),

  check('email')
      .isEmail()
      .withMessage('invalid email address')
      .normalizeEmail(),

  check('password')
      .isLength({min: 8, max: 16})
      .withMessage('your password should have min and max length between 8-16')
      .matches(/\d/)
      .withMessage('your password should have at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('your password should have at least one sepcial character'),
];

const validateUser = (req, res, next) => {
  const errorResult = validationResult(req);
  const hasError = !errorResult.isEmpty();

  if (hasError) {
    const errorMsg = errorResult.errors[0].msg;
    return failureRedirect(req, res, errorMsg, '/register');
  }
  next();
};

const sortConfig = {
  Alphabet: 'alpha',
  Rating: 'rating',
  MOST_REVIEW: 'reviews',
};

const validateSort = async (req, res, next) => {
  let {sort= 'alpha'} = req.query;
  let campgrounds = [];

  switch (sort) {
    case sortConfig.Alphabet:
      campgrounds = await Campground.find().sort({'title': 1}).populate('images', 'url');
      break;
    case sortConfig.Rating:
      campgrounds = await Campground.find().sort({'rating': -1}).populate('images', 'url');
      break;
    case sortConfig.MOST_REVIEW:
      campgrounds = await Campground.find().populate('images', 'url');
      campgrounds.sort( (a, b) => -(a.reviews.length > b.reviews.length) );
      break;
    default:
      sort = sortConfig.Alphabet;
      campgrounds = await Campground.find().sort({'title': 1}).populate('images', 'url');
  }
  const result = {};
  result.currentSort = sort;
  result.campgrounds = campgrounds;
  res.sortResult = result;
  next();
};

const pageConfig = {
  limit: 5,
  maxWindow: 5,
};

const validatePage = (req, res, next) => {
  let {page = 1} = req.query;
  const {limit, maxWindow} = pageConfig;
  const {campgrounds} = res.sortResult;
  const pages = Math.ceil( campgrounds.length / limit);

  try {
    page = parseInt(page);
    page = page <= pages ? page : 1;
  } catch (e) {
    page = 1;
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const result = {};
  result.currentPage = page;
  result.campgrounds = campgrounds.slice(startIndex, endIndex);
  result.pages = pages;
  result.maxWindow = maxWindow;

  res.paginatedResult = result;
  next();
};

module.exports = {
  checkUserInput,
  validateSort,
  validatePage,
  validateUser,
  validateLoggedIn,
  validateCampgroundId,
  validateCampgroundSchema,
  validateCampgroundAuthor,
  validateReview,
  validateReviewAuthor,
};
