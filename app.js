const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const { fetchTriviaCategories } = require('./utils/trivia');

const appData = {};
const PORT = 3000;
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Trivia50 ❓',
  });
});

app.post('/', async (req, res) => {
  // console.log(req.body);
  try {
    if (!appData.categories) {
      const categories = await fetchTriviaCategories();
      appData.categories = categories.map((category) => category.id);
    }
  } catch (error) {
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
  console.log('okay');
  // TODO: Generate a new USER Token from Trivia API
  // The above might need a session management.
  // Alternatively, a /token endpoint could be set that game page will consume
  // TODO: Redirect the user to the game page
  res.redirect('/');
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

app.listen(PORT);
