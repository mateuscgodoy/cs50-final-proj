require('dotenv').config();

const path = require('path');

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const {
  fetchTriviaCategories,
  fetchTriviaQuestion,
  getFrontendQuestion,
} = require('./utils/triviaAPI');
const triviaController = require('./controllers/trivia');
const hasToken = require('./middlewares/hasToken');

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

app.use(triviaController);

app.get('/categories', async (req, res) => {
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

app.get('/question', hasToken, async (req, res) => {
  const question = await fetchTriviaQuestion(req.session.user);
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

app.listen(process.env.SERVER_PORT);
