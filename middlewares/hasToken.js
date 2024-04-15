module.exports = (req, res, next) => {
  if (req.session.token) next();
  else res.redirect('/');
};
