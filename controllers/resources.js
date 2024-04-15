const express = require('express');

const {
  fetchTriviaCategories,
  fetchTriviaQuestion,
  getFrontendQuestion,
} = require('../utils/triviaAPI');
const hasToken = require('../middlewares/hasToken');

const router = express.Router();

router.get('/categories', async (req, res) => {
  try {
    const categories = await fetchTriviaCategories();
    res.send({
      status: 200,
      data: categories,
      message: 'Categories fetched with success.',
    });
  } catch (error) {
    // TODO: Implement a catch all Error method.
    res.send({
      status: 500,
      message: error.message || 'Categories fetching failed. Try again later.',
    });
  }
});

router.get('/question', hasToken, async (req, res) => {
  const questionNotAnswered =
    req.session.question && !req.session.question.answered;
  const question = questionNotAnswered
    ? req.session.question
    : await fetchTriviaQuestion(req.session.user);
  const user = req.session.user;

  req.session.regenerate(function (err) {
    if (err) next(err);
    req.session.user = user;
    req.session.question = question;
  });

  const formattedQuestion = getFrontendQuestion(question);

  req.session.save(function (err) {
    if (err) return next(err);
    res.send(formattedQuestion);
  });
});

module.exports = router;
