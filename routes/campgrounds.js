const express = require('express');
const multer = require('multer');
const { storage } = require('../cloudinary');
const router = express.Router();
const upload = multer({ storage });
const catchAsync = require('../utils/catchAsync');
const controller = require('../controllers/campgrounds');

const {
    validateSort, 
    validatePage,
    validateLoggedIn, 
    validateCampgroundId,
    validateCampgroundSchema, 
    validateCampgroundAuthor
} = require('../middlewares');

router.route('/')
    .get(
        validateSort,
        validatePage,
        catchAsync(controller.shownIndex)
    )
    .post(
        validateLoggedIn, 
        upload.array('image'),
        validateCampgroundSchema, 
        catchAsync(controller.createCampground)
    );

router.get('/new', validateLoggedIn, controller.renderNewForm);

router.route('/:id')
    .get(
        validateCampgroundId,
        catchAsync(controller.showCampground)
    )
    .put(
        validateCampgroundId,
        validateLoggedIn, 
        validateCampgroundAuthor, 
        upload.array('image'),
        validateCampgroundSchema, 
        catchAsync(controller.updateCampground)
    )
    .delete(
        validateCampgroundId,
        validateLoggedIn, 
        validateCampgroundAuthor, 
        catchAsync(controller.deleteCampground)
    );


router.get(
    '/:id/edit',
    validateCampgroundId,
    validateLoggedIn, 
    validateCampgroundAuthor, 
    catchAsync(controller.renderEditForm)
);

module.exports = router;