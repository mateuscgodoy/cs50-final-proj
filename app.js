require('dotenv').config();

const path = require('path');

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const { fetchTriviaCategories } = require('./utils/triviaAPI');
const triviaController = require('./controllers/trivia');

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

app.listen(process.env.SERVER_PORT);
