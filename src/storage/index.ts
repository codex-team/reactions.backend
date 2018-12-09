import Database from './../database/index';
import Reactions from '../models/Reactions';

/** Class which controls database */
export class Storage {

  private database: Database;

  /**
   * Creates an instance of the Storage
   *
   * @constructor
   * @this {Storage}
   * @param {string} [url=@see config.URL] - the database's server address
   * @param {string} [dbName=@see config.DbName] - the name of the database
   */
  constructor (url: string = process.env.DB_URL as string, dbName: string = process.env.DB_NAME as string) {
    this.database = new Database(url, dbName);
  }

  /**
   * Returns reactions object for passed domain and id
   *
   * @this {Storage}
   * @async
   *
   * @param {string} domain - module`s domain
   * @param {Reactions} reactions
   * @return {Promise < Reactions | undefined >}
   */
  public async getReactions (domain: string, reactions: Reactions): Promise<Reactions | undefined> {
    const collection = this.getModulesCollection(domain);
    const query = { id: reactions.id };
    const result = await this.database.find(collection, query);

    if (result.length === 0) {
      this.database.insert(collection, reactions);
      return;
    }

    const { id, title, options } = result.shift();

    return new Reactions(id, title, options);
  }

  /**
   * Returns id of the reaction selected by the user or undefined if user didn't vote
   *
   * @this {Storage}
   * @async
   *
   * @param {string} domain - module`s domain
   * @param {string} id - module`s id
   * @param {string} userId - user id
   *
   * @return {Promise<number | undefined>} - voted reaction
   */
  public async getUserReaction (domain: string, id: string, userId: number | string): Promise<number | undefined> {

    const collection = this.getUserReactionsCollection(domain, id);
    const query = {
      user: userId
    };

    const dbResult = await this.database.find(collection, query);

    if (dbResult.length === 0) {
      return;
    }

    return dbResult.shift().reaction;
  }

  /**
   * Updates user's choice and reactions counters
   *
   * @this {Storage}
   * @async
   *
   * @param {string} domain - module`s domain
   * @param {string} id - module`s id
   * @param {string} userId - user id
   * @param {string} reaction - voted reaction
   *
   *  @return {Promise<Reactions | undefined>}
   */
  public async vote (
    domain: string,
    id: string,
    userId: number | string,
    reaction: number
  ): Promise<Reactions | undefined> {
    const modulesCollection = this.getModulesCollection(domain);
    const userReactionsCollection = this.getUserReactionsCollection(domain, id);

    const savedReactions = await this.getReactions(domain, new Reactions(id));
    const userReaction = await this.getUserReaction(domain, id, userId);

    if (!savedReactions) {
      return;
    }

    /**
     * Is user voted previously, decrement his reaction
     */
    if (userReaction) {
      savedReactions.options![userReaction]--;
    }

    savedReactions.options![reaction]++;

    const moduleQuery = {
      id: savedReactions!.id
    };
    const userReactionQuery = {
      user: userId
    };

    /**
     * Update counters
     */
    await this.database.update(
      modulesCollection,
      moduleQuery,
      { $set: savedReactions }
    );

    /**
     * Update user reaction
     */
    await this.database.update(
      userReactionsCollection,
      userReactionQuery,
      { $set: { reaction } },
      { upsert: true }
    );

    return new Reactions(savedReactions.id, savedReactions.title, savedReactions.options);
  }

  /**
   * Updates reactions and user's choice
   *
   * @this {Storage}
   * @async
   * @return {Promise<void>}
   * @param domain
   * @param id
   * @param userId
   * @param reaction
   */
  public async unvote (domain: string, id: string, userId: string, reaction: number): Promise<Reactions | undefined> {

    const modulesCollection = this.getModulesCollection(domain);
    const userReactionsCollection = this.getUserReactionsCollection(domain, id);
    const savedReactions = await this.getReactions(domain, new Reactions(id));

    if (!savedReactions) {
      return;
    }

    savedReactions.options![reaction]--;

    const moduleQuery = {
      id: savedReactions!.id
    };
    const userReactionQuery = {
      user: userId
    };

    /**
     * Update counters
     */
    await this.database.update(
      modulesCollection,
      moduleQuery,
      { $set: savedReactions }
    );

    /**
     * Remove user reaction
     */
    await this.database.remove(
      userReactionsCollection,
      userReactionQuery
    );

    return new Reactions(savedReactions.id, savedReactions.title, savedReactions.options);
  }

  /**
   * Returns name of the modules collection
   *
   * @this {Storage}
   * @private
   *
   * @param {string} domain - module`s domain
   *
   * @return {string} - name of the modules collection for given domain
   */
  private getModulesCollection (domain: string): string {
    return `${domain}_${process.env.REACTIONS_PREFIX}`;
  }

  /**
   * Return name of the collection with user reactions
   *
   * @param {string} domain - module`s domain
   * @param {string} id - module`s id
   *
   * @return {string} - name of the collection
   */
  private getUserReactionsCollection (domain: string, id: string): string {
    return `${domain}_${process.env.REACTIONS_PREFIX}_${id}`;
  }

}

export default new Storage();
