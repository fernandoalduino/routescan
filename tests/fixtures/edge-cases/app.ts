import express from 'express';
const app = express();

app.get(`/ping`, (req, res) => res.send('pong'));

const arr: any = [];
arr.get('/not-a-route');

app.get('relative', (req, res) => res.send('x'));

app.patch('/items/:id', (req, res) => res.send('patched'));

export default app;