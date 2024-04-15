require('dotenv').config();

const path = require('path');

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const triviaRouter = require('./controllers/trivia');
const resourcesRouter = require('./controllers/resources');

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

app.use(resourcesRouter);
app.use(triviaRouter);

app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 - Content Not Found',
  });
});

app.use((error, req, res, next) => {
  const status = error.status || 500;
  res.status(status).render('error', {
    title: `Error ${status}`,
    message: error.message,
  });
});

app.listen(process.env.SERVER_PORT);
