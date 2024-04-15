const express = require('express');

const {
  fetchTriviaCategories,
  fetchTriviaToken,
} = require('../utils/triviaAPI');
const hasToken = require('../middlewares/hasToken');

const router = express.Router();

const appData = {};

router.get('/', (req, res) => {
  res.render('index', {
    title: 'Trivia50 - Home',
  });
});

router.post('/', async (req, res) => {
  try {
    if (!appData.categories) {
      const categories = await fetchTriviaCategories();
      appData.categories = categories.map((category) => category.id);
    }
  } catch (error) {
    // TODO: Implement a catch all Error method.
    console.error(error);
    return res.redirect('/');
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

  try {
    const token = await fetchTriviaToken();

    req.session.regenerate(function (err) {
      if (err) next(err);
      req.session.token = token;
    });

    req.session.save(function (err) {
      if (err) return next(err);

      res.redirect('/game');
    });
  } catch (error) {
    // TODO: Implement a catch all Error method.
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

module.exports = router;
