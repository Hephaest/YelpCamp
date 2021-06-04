const failureRedirect = (req, res, msg, url) => {
  req.flash('error', msg);
  res.redirect(url);
};

const successRedirect = (req, res, msg, url) => {
  req.flash('success', msg);
  res.redirect(url);
};

module.exports = {failureRedirect, successRedirect};
