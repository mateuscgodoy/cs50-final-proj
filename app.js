const path = require('path');

const express = require('express');

const PORT = 3000;
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Trivia50 ❓',
  });
});

app.get('/rules', (req, res) => {
  res.render('rules', {
    title: 'Trivia50 - Rules',
  });
});

app.listen(PORT);
