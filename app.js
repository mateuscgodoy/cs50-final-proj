const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const { processCategories } = require('./utils/trivia');

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

app.post('/', (req, res) => {
  console.log(req.body);
  res.redirect('/');
});

app.get('/categories', async (req, res) => {
  try {
    const response = await fetch('https://opentdb.com/api_category.php');
    if (!response.ok) {
      throw new Error(
        'Categories server encountered a problem. Try again later.'
      );
    }
    const { trivia_categories } = await response.json();
    return {
      status: 200,
      data: processCategories(trivia_categories),
      message: 'Categories fetched with success.',
    };
  } catch (error) {
    return {
      status: 500,
      message: error.message || 'Categories fetching failed. Try again later.',
    };
  }
});

app.get('/rules', (req, res) => {
  res.render('rules', {
    title: 'Trivia50 - Rules',
  });
});

app.listen(PORT);
