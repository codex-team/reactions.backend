import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.send({msg: 'Server is up and running'});
});

app.all('*', (req, res) => {
    res.status(404).send({msg: 'not found'});
});

export default app;
