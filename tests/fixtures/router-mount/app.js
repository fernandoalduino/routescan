const express = require('express');
const usersRouter = require('./users').default;
const app = express();

app.get('/health', (req, res) => res.send('ok'));
app.use('/users', usersRouter);

app.listen(3000);