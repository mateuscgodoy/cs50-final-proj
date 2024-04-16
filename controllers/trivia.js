const express = require('express');

const {
  getTriviaCategories,
  fetchTriviaToken,
  createUser,
} = require('../utils/triviaAPI');
const hasToken = require('../middlewares/hasToken');
const hasQuestion = require('../middlewares/hasQuestion');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', {
    title: 'Trivia50 - Home',
  });
});

router.post('/', async (req, res, next) => {
  try {
    const categories = await getTriviaCategories();
    const categoriesIds = categories.map((category) => category.id);

    const keys = Object.keys(req.body);
    const allValidKeys = keys.every((key) =>
      categoriesIds.includes(parseInt(key))
    );
    if (!allValidKeys || keys.length < 10) {
      // TODO: Return an error message to the frontend otherwise
      return res.redirect('/');
    }

    const token = await fetchTriviaToken();

    req.session.regenerate(function (err) {
      if (err) next(err);
      req.session.user = createUser(token, keys);
    });

    req.session.save(function (err) {
      if (err) return next(err);

      res.redirect('/game');
    });
  } catch (error) {
    // TODO: Implement a catch all Error method.
    next(error);
  }
});

router.get('/rules', (req, res) => {
  res.render('rules', {
    title: 'Trivia50 - Rules',
  });
});

router.get('/game', hasToken, (req, res) => {
  res.render('game', {
    title: 'Trivia50 - Game',
  });
});

router.post('/game', hasToken, hasQuestion, (req, res) => {
  const { body } = req;
  if (body.answer) {
    console.log(body.answer, req.session.question.correct_answer);
    if (
      body.answer.toLowerCase() ===
      req.session.question.correct_answer.toLowerCase()
    ) {
      req.session.question.answered = body.answer;
      req.session.save(function (err) {
        if (err) next(err);
        else return res.redirect('/game');
      });
    } else {
      req.session.question.answered = 'X';
      req.session.save(function (err) {
        if (err) next(err);
        else return res.redirect('/game');
      });
    }
  } else if (body.lifeline) {
    // TODO: Process lifeline
    console.log(body.lifeline);
    return res.redirect('/game');
  } else {
    next({
      status: 400,
      message: 'Bad Request. This usage is not covered by the application.',
    });
  }
});

router.get('/end', hasToken, hasQuestion, (req, res, next) => {
  req.session.destroy(function (err) {
    if (err) next(err);
    else {
      res.render('end', {
        title: 'Trivia50 - Game Over',
      });
    }
  });
});

module.exports = router;
