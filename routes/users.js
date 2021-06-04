const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const controller = require('../controllers/users');

const {
  checkUserInput,
  validateUser,
} = require('../middlewares');

const authConfig = {
  failureFlash: true,
  failureRedirect: '/login',
};

router.route('/register')
    .get(controller.renderRegisterForm)
    .post(
        checkUserInput,
        validateUser,
        catchAsync(controller.registerUser),
    );

router.route('/login')
    .get(controller.renderLoginForm)
    .post(
        passport.authenticate('local', authConfig),
        catchAsync(controller.loginUser),
    );

router.get('/logout', controller.logoutUser);

module.exports = router;
