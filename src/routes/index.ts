import express, { Express } from 'express';
import Actions from '../actions';

/** Class aggregating an application routes. */
export class Routes {

  /** Express instance. */
  private readonly app: Express;

  /** Actions instance. */
  private readonly actions: Actions;

  /**
   * Create a route class.
   */
  constructor () {
    this.actions = Actions;
    this.app = express();
  }

  /**
   * Bind routes with actions.
   * @return {Express} express instance.
   */
  public getRoutes (): Express {
    /** Root route */
    this.app.get('/', async (req, res) => {
      res.send({ msg: 'Server is up and running' });
    });

    /** Wrong route handle */
    this.app.all('*', (req, res) => {
      res.status(404).send({ msg: 'not found' });
    });

    return this.app;
  }

}
