module.exports = (req, res, next) => {
  if (req.session && req.session.question) next();
  else res.redirect('/');
};
