require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const processEvent = require('./lib/eventHandler');

const env = process.env;

const app = express();

app.use(morgan('combined'));
app.use(bodyParser.json());

const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

//eslint-disable-next-line
app.use((err, req, res, next) => {
  const message = err.expose ? err.message : 'An error occured';
  res.status(err.status || 500);
  res.json({ error: message });
});

app.post(
  '/',
  asyncMiddleware(async (req, res) => {
    const { event, context } = req.body;
    const { statusCode, body } = await processEvent(event, context, env);
    res.status(statusCode);
    res.json(body);
  })
);

app.use('/*', (req, res) => {
  res.status(404);
  res.json({ error: 'Not found' });
});

app.listen(3000, () => console.log('server started'));
module.exports = app;
