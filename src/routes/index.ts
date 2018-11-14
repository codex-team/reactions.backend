import express from 'express';
import {Express} from 'express';
import {Actions} from "../actions";
import Reactions from "../models/Reactions";

export class Routes {

    private readonly app: Express;
    private readonly actions: Actions;

    constructor() {
        this.actions = new Actions();
        this.app = express();
    }

    public getRoutes() {
        this.app.get('/', async (req, res) => {
            const reactions = await this.actions.getReactions();
            res.send({msg: 'Server is up and running', reactions});

        });

        this.app.all('*', (req, res) => {
            res.status(404).send({msg: 'not found'});
        });

        return this.app;

    }

}