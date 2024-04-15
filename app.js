require('dotenv').config();

const path = require('path');

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const { fetchTriviaCategories, fetchTriviaToken } = require('./utils/trivia');
const hasToken = require('./middlewares/hasToken');

const appData = {};
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Trivia50 - Home',
  });
});

app.post('/', async (req, res) => {
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

app.get('/categories', async (req, res) => {
  try {
    appData.categories = await fetchTriviaCategories();
    res.send({
      status: 200,
      data: appData.categories,
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

app.get('/rules', (req, res) => {
  res.render('rules', {
    title: 'Trivia50 - Rules',
  });
});

app.get('/game', hasToken, (req, res) => {
  res.render('game', {
    title: 'Trivia50 - Game',
  });
});

app.listen(process.env.SERVER_PORT);
