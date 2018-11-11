import express from 'express';
import {getReactions} from "../actions";
import Reactions from "../models/Reactions";

const app = express();

app.get('/', (req, res) => {
    getReactions().then((reactions: Reactions) => {
        res.send({msg: 'Server is up and running', reactions});
    });
});

app.all('*', (req, res) => {
    res.status(404).send({msg: 'not found'});
});

export default app;
