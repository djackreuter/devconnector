require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5000;

const db = require('./config/keys').mongoURI;
mongoose.connect(db, { useNewUrlParser: true })
  .then(() => console.log('MongoDB connected'))
  .catch((e) => console.log('Could not connect', e));

app.get('/', (req, res) => {
  res.send('Hello');
});

app.listen(port, () => console.log(`Server running on port ${port}`));
