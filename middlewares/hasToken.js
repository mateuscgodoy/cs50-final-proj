module.exports = (req, res, next) => {
  if (req.session.user.token) next();
  else res.redirect('/');
};
