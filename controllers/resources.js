const express = require('express');

const {
  getTriviaCategories,
  fetchTriviaQuestion,
  getFrontendQuestion,
} = require('../utils/triviaAPI');
const hasToken = require('../middlewares/hasToken');

const router = express.Router();

router.get('/categories', async (req, res) => {
  try {
    const categories = await getTriviaCategories();
    res.send({
      status: 200,
      data: categories,
      message: 'Categories fetched with success.',
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error.message || 'Categories fetching failed. Try again later.',
    });
  }
});

router.get('/question', hasToken, async (req, res) => {
  const user = req.session.user;
  const question =
    req.session.question || (await fetchTriviaQuestion(req.session.user));
  const notDisplayedYet =
    !req.session.question || !req.session.question.displayQuestion;
  const displayQuestion = notDisplayedYet
    ? getFrontendQuestion(question)
    : req.session.question.displayQuestion;

  console.log(question.correct_answer);

  if (req.session.question) {
    if (req.session.question.answered === 'X') {
      req.session.destroy(function (err) {
        if (err) return next(err);
        res.send(displayQuestion);
      });
    } else {
      req.session.regenerate(function (err) {
        if (err) next(err);
        req.session.user = user;
        delete req.session.question;
      });

      req.session.save(function (err) {
        if (err) return next(err);
        res.send(displayQuestion);
      });
    }
  } else {
    req.session.regenerate(function (err) {
      if (err) next(err);
      req.session.user = user;
      req.session.question = question;
      req.session.question.displayQuestion = displayQuestion;
    });

    req.session.save(function (err) {
      if (err) return next(err);
      res.send(displayQuestion);
    });
  }
});

module.exports = router;
