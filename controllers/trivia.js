const express = require('express');

const {
  fetchTriviaCategories,
  fetchTriviaToken,
  createUser,
} = require('../utils/triviaAPI');
const hasToken = require('../middlewares/hasToken');
const hasQuestion = require('../middlewares/hasQuestion');

const router = express.Router();

//! Horrible practice ☹️
const appData = {};

router.get('/', (req, res) => {
  res.render('index', {
    title: 'Trivia50 - Home',
  });
});

router.post('/', async (req, res) => {
  try {
    console.log(appData);
    if (!appData.categories) {
      const categories = await fetchTriviaCategories();
      appData.categories = categories.map((category) => category.id);
    }

    const keys = Object.keys(req.body);
    const allValidKeys = keys.every((key) =>
      appData.categories.includes(parseInt(key))
    );
    if (!allValidKeys || keys.length < 10) {
      // TODO: Return an error message to the frontend otherwise
      console.error('Invalid keys provided');
      return res.redirect('/');
    }

    appData.userCategories = keys;
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
    console.error(error);
    return res.redirect('/');
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
    if (body.answer === req.session.question.correct_answer) {
      req.session.question.answered = true;
      req.session.save(function (err) {
        if (err) next(err);
        else return res.redirect('/game');
      });
    } else {
      return res.redirect('/end');
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
