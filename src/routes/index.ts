import express, {Express} from 'express';
import {Actions} from "../actions";

/** Class aggregating an application routes. */
export class Routes {

    /** Express instance. */
    private readonly app: Express;

    /** Actions instance. */
    private readonly actions: Actions;

    /**
     * Create a route class.
     */
    constructor() {
        this.actions = new Actions();
        this.app = express();
    }

    /**
     * Bind routes with actions.
     * @return {Express} express instance.
     */
    public getRoutes(): Express {
        /** Root route */
        this.app.get('/', async (req, res) => {
            const reactions = await this.actions.getReactions(undefined);
            res.send({msg: 'Server is up and running', reactions});

        });

        /** Wrong route handle */
        this.app.all('*', (req, res) => {
            res.status(404).send({msg: 'not found'});
        });

        return this.app;

    }

}