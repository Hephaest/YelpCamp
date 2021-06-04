const User = require('../models/user');
const {failureRedirect, successRedirect} = require('../utils/redirectHandlers');

const signupMsg = (username) => `Thank you for registering, ${username}!`;
const loginMsg = (username) => `Welcome back, ${ username }!`;
const logoutMsg = (username) => `Bye, ${ username }! See you next time!`;

const viewPath = (fileName) => `users/${fileName}`;
const indexUrl = '/campgrounds';

const renderRegisterForm = (req, res) => {
  res.render(viewPath('register'));
};

const renderLoginForm = (req, res) => {
  res.render(viewPath('login'));
};

const registerUser = async (req, res, next) => {
  try {
    const {username, password, email} = req.body;
    const user = new User({username, email});
    const registerUser = await User.register(user, password);
    req.login(registerUser, (err) => {
      if (err) return next(err);
      successRedirect(req, res, signupMsg(username), indexUrl);
    });
  } catch (e) {
    failureRedirect(req, res, e.message, '/register');
  }
};

const loginUser = async (req, res) => {
  const {username} = req.user;
  const redirectUrl = req.session.redirectUrl || indexUrl;
  delete req.session.redirectUrl;
  successRedirect(req, res, loginMsg(username), redirectUrl);
};

const logoutUser = (req, res) => {
  try {
    const {username} = req.user;
    req.logout();
    successRedirect(req, res, logoutMsg(username), indexUrl);
  } catch (e) {
    req.logout();
    successRedirect(req, res, 'Bye!', indexUrl);
  }
};

module.exports = {
  renderRegisterForm,
  renderLoginForm,
  registerUser,
  loginUser,
  logoutUser,
};
