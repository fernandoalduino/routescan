const express = require('express');
const app = express();

app.get('/users', (req, res) => res.send('list'));
app.post('/users', (req, res) => res.send('create'));
app.delete('/users/:id', (req, res) => res.send('remove'));

app.listen(3000);