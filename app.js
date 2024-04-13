const express = require('express');

const PORT = 3000;
const app = express();

app.get('/', (req, res) => {
  res.send('INCOMING!');
});

app.listen(PORT);
