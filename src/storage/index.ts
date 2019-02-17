import Database from './../database/index';
import Reactions from './../models/Reactions';
import Cache from './../cache/index';
import {UserToken} from '../actions/vote-token';

/** Class which controls database */
export class Storage {

  private database: Database;

  private cache: Cache;

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
    this.cache = new Cache({
      stdTTL: Cache.time.MINUTE * 10
    });
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

    const moduleCacheKey = `${collection}_${reactions.id}`;
    const result = await this.cache.get(moduleCacheKey, () => {
      return this.database.find(collection, query);
    });

    if (result.length === 0) {
      await this.database.insert(collection, reactions);

      return;
    }

    const { id, title, options } = result.shift();

    if (reactions.options && Object.keys(reactions.options).length) {
      const removedReactions = Object.keys(options).filter((hash: any) => !(hash in reactions.options!));
      const addedReactions = Object.keys(reactions.options).filter((hash: any) => !(hash in options));

      removedReactions.forEach(hash => {
        delete options[hash];
      });

      removedReactions.forEach(hash => {
        options[hash] = 0;
      });

      if (addedReactions.length) {
        const newOptions = addedReactions.reduce((result, hash) => {
          result[`options.${hash}`] = 0;
          return result;
        }, {} as any);

        await this.database.update(
          collection,
          {
            id: reactions.id
          },
          {
            $set: {
              ...newOptions
            }
          });

        /** Clear cache */
        this.cache.del(moduleCacheKey);
      }
    }
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
  public async getUserReaction (domain: string, id: string, userId: string): Promise<number | undefined> {

    const collection = this.getUserReactionsCollection(domain, id);
    const query = {
      user: String(userId)
    };

    const moduleCacheKey = `${collection}_${query.user}`;
    const dbResult = await this.cache.get(moduleCacheKey, () => {
      return this.database.find(collection, query);
    });

    if (dbResult.length === 0) {
      return;
    }

    return +dbResult.shift().reaction;
  }

  /**
   * Returns token that indicates if user can vote
   *
   * @this {Storage}
   * @async
   *
   * @param {string} domain - module`s domain
   * @param {string} userId - user id
   *
   * @return {Promise<UserToken>} - token
   */
  public async getUserToken (domain: string, userId: string): Promise<UserToken> {

    const collection = this.getTokensCollection(domain);
    const query = {
      user: String(userId)
    };

    const moduleCacheKey = `${collection}_${query.user}`;
    const dbResult = await this.database.find(collection, query);

    return dbResult.pop();
  }

  /**
   * Insert token
   *
   * @this {Storage}
   * @async
   *
   * @param {string} domain - module`s domain
   * @param {string} userId - user id
   *
   * @return {Promise<UserToken>} - inserted token
   */
  public async insertUserToken (domain: string, userId: string): Promise<UserToken> {

    const collection = this.getTokensCollection(domain);
    let token = {
      user: userId,
      startDate: new Date()
    };
    token = (await this.database.insert(collection, token)).ops[0];

    return token as UserToken;

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
    userId: string,
    reaction: number
  ): Promise<Reactions | undefined> {
    const modulesCollection = this.getModulesCollection(domain);
    const userReactionsCollection = this.getUserReactionsCollection(domain, id);
    const userReaction = await this.getUserReaction(domain, id, userId);

    const moduleQuery = {
      id
    };
    const userReactionQuery = {
      user: String(userId)
    };

    const incOptions = {
      [`options.${reaction}`]: 1
    };

    if (userReaction) {
      incOptions[`options.${userReaction}`] = -1;
    }

    /**
     * Update counters
     */
    const moduleCacheKey = `${modulesCollection}_${moduleQuery.id}`;

    await this.database.update(
      modulesCollection,
      moduleQuery,
      {
        $inc: {
          ...incOptions
        }
      }
    );

    /** Clear cache */
    this.cache.del(moduleCacheKey);

    /**
     * Update user reaction
     */
    const userCacheKey = `${userReactionsCollection}_${userReactionQuery.user}`;

    await this.database.update(
      userReactionsCollection,
      userReactionQuery,
      { $set: { reaction } },
      { upsert: true }
    );

    /** Clear cache */
    this.cache.del(userCacheKey);

    const savedReactions = await this.getReactions(domain, new Reactions(id));
    const reactions = new Reactions(savedReactions!.id, savedReactions!.title, savedReactions!.options);

    reactions.userId = userId;
    reactions.reaction = reaction;

    return reactions;
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
    const userReaction = await this.getUserReaction(domain, id, userId);

    if (userReaction !== +reaction) {
      return;
    }

    const moduleQuery = {
      id
    };
    const userReactionQuery = {
      user: String(userId)
    };

    /**
     * Update counters
     */
    const moduleCacheKey = `${modulesCollection}_${moduleQuery.id}`;

    await this.database.update(
      modulesCollection,
      moduleQuery,
      {
        $inc: { [`options.${reaction}`]: -1 }
      }
    );

    /** Clear cache */
    this.cache.del(moduleCacheKey);

    /**
     * Remove user reaction
     */
    const userCacheKey = `${userReactionsCollection}_${userReactionQuery.user}`;

    await this.database.remove(
      userReactionsCollection,
      userReactionQuery
    );

    /** Clear cache */
    this.cache.del(userCacheKey);

    const savedReactions = await this.getReactions(domain, new Reactions(id));
    const reactions = new Reactions(savedReactions!.id, savedReactions!.title, savedReactions!.options);

    reactions.userId = userId;
    reactions.reaction = reaction;

    return reactions;
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
    return `${domain}__${id}`;
  }

  /**
   * Return name of the collection with tokes
   *
   * @param {string} domain - module`s domain
   *
   * @return {string} - name of the collection
   */
  private getTokensCollection (domain: string): string {
    return `${domain}_${process.env.TOKENS_POSTFIX}`;
  }

}

export default new Storage();
