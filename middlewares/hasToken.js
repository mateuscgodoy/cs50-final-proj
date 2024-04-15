module.exports = (req, res, next) => {
  if (req.session && req.session.user.token) next();
  else res.redirect('/');
};
