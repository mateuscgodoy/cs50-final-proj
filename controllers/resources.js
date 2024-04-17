const express = require('express');

const {
  getTriviaCategories,
  fetchTriviaQuestion,
  getFrontendQuestion,
} = require('../utils/triviaAPI');
const hasToken = require('../middlewares/hasToken');
const hasQuestion = require('../middlewares/hasQuestion');

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

router.get('/question', hasToken, async (req, res, next) => {
  try {
    const { user } = req.session;
    req.session.regenerate(function (err) {
      if (err) next(err);
      else req.session.user = user;
    });

    const question = req.session.question || (await fetchTriviaQuestion(user));
    question.display = question.display || getFrontendQuestion(question);
    req.session.question = question;
    req.session.save(function (err) {
      if (err) next(err);
      else res.send(question.display);
    });
  } catch (error) {
    next(error);
  }
});

router.post('/answer', hasToken, hasQuestion, (req, res, next) => {
  const { user } = req.session;
  const { answer } = req.body;
  const isCorrect = req.session.question.correct_answer === answer;

  req.session.regenerate(function (err) {
    if (err) next(err);
    else req.session.user = user;
  });

  req.session.save(function (err) {
    if (err) next(err);
    else res.status(200).send({ isCorrect });
  });
});

module.exports = router;
