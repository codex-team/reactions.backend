import Database from './../database/index'

/**
 * Default value of the url
 *
 * @type {string}
 * @global
 */
const defaultUrl = 'mongodb://localhost:27017'

/**
 * Default value of database
 *
 * @type {string}
 * @global
 */
const defaultDbName = 'reactions'

/**
 * Postfix which indicates counters collection
 *
 * @type {string}
 * @global
 */
const countersPostfix = '_counters'

/** Class which controls database */
export default class Storage {

  /**
   * Database controled by the Strorage
   *
   * @type {Database}
   * @private
   */
  private database: Database

  /**
   * Creates an instance of the Storage
   *
   * @this {Database}
   * @param {string} [url=@see defaultUrl] - the database's server adress
   * @param {string} [dbName=@see defaultDbName] - the name of the database
   */
  constructor (url: string= defaultUrl, dbName: string= defaultDbName) {
    this.database = new Database(url, dbName)
  }

  /**
   * Addes an artical to the database
   *
   * @this {Storage}
   * @param {string} domain - domain adress
   * @param {string} article - article ID
   * @param {number} reactions - amount of the reactions
   * @async
   * @return {Promise<void>}
   */
  public async addArticle (domain: string, article: string, reactions: number): Promise<void> {
    await this.addCounters(domain, article, reactions)
  }

  /**
   * Removes an article from the database
   *
   * @this {Storage}
   * @param {string} domain - domain adress
   * @param {string} article - article ID
   * @async
   * @return {Promise<void>}
   */
  public async removeArticle (domain: string, article: string): Promise<void> {
    await this.removeCounters(domain, article)
    await this.database.remove(domain, { article: article })
  }

  /**
   * Checks whether article exists in the database
   *
   * @this {Storage}
   * @param {string} domain - domain adress
   * @param {string} article - article ID
   * @async
   * @return {Promise<boolean>} true if the article exists
   */
  public async isArticleExists (domain: string, article: string): Promise<boolean> {
    return this.isCountersExist(domain, article)
  }

  /**
   * Addes a counter to the database
   *
   * @this {Storage}
   * @param {string} domain - domain adress
   * @param {string} article - article ID
   * @param {number} reactions - amount of the reactions
   * @async
   * @private
   * @return {Promise<void>}
   */
  private async addCounters (domain: string, article: string, reactions: number): Promise<void> {

    const data = this.makeCountersData(article, true, reactions)
    await this.database.insert(domain + countersPostfix, data)

  }

  /**
   * Returns counters array
   *
   * @this {Storage}
   * @param {string} domain - domain adress
   * @param {string} article - article ID
   * @async
   * @return {Promise< Array<number> >}
   */
  public async getCounters (domain: string, article: string): Promise< Array<number> > {

      const answerFromDb = await this.database.find(domain + countersPostfix, this.makeCountersData(article))
      return answerFromDb[0].rates

  }

  /**
   * Updates values of the counters
   *
   * @this {Storage}
   * @param {string} domain - domain adress
   * @param {string} article - article ID
   * @param {Array<number>} rates - new values of the counters
   * @async
   * @private
   * @return {Promise<void>}
   */
  private async updateCounters (domain: string, article: string, rates: Array<number>): Promise<void> {

    await this.database.update(
      domain + countersPostfix,
      this.makeCountersData(article),
      { $set: { rates: rates } }
    )

  }

  /**
   * Changes the values of the counter
   *
   * @this {Storage}
   * @param {string} domain - domain adress
   * @param {string} article - article ID
   * @param {string} user - user ID
   * @param {number} reaction - new number of the selected reaction
   * @async
   * @private
   * @return {Promise<void>}
   */
  private async changeCounter (domain: string, article: string, user: string, reaction: number): Promise<void> {

    const rates = await this.getCounters(domain, article)
    const oldReaction = await this.getUserReaction(domain, article, user)

    if (oldReaction !== -1) {
      rates[oldReaction]--
    }

    if (reaction !== -1) {
      rates[reaction]++
    }

    await this.updateCounters(domain, article, rates)

  }

  /**
   * Removes counters from the Database
   *
   * @this {Storage}
   * @param {string} domain - domain adress
   * @param {string} article - article ID
   * @async
   * @private
   * @return {Promise<void>}
   */
  private async removeCounters (domain: string, article: string): Promise<void> {
    await this.database.remove(domain + countersPostfix, this.makeCountersData(article))
  }

  /**
   * Checks whether counters exist in the database
   *
   * @this {Storage}
   * @param {string} domain - domain adress
   * @param {string} article - article ID
   * @async
   * @private
   * @return {Promise<boolean>} true if the counters exist
   */
  private async isCountersExist (domain: string, article: string): Promise<boolean> {
    const answerFromDb = await this.database.find(domain, this.makeCountersData(article))
    return answerFromDb.length > 0
  }

  /**
   * Return special object which contains information about counters
   *
   * @this {Storage}
   * @param {string} article - article ID
   * @param {boolean} [toInsert=false] - flag which indicates aim of the calling method
   * @param {number} [reactions=0] - amount of the reactions
   * @private
   * @return {object} information about counters
   */
  private makeCountersData (article: string, toInsert: boolean = false, reactions: number= 0): object {

    const res: any = {
      article: article
    }

    if (toInsert === true) {

      res.rates = new Array<number>(reactions)

      for (let i = 0; i < reactions; i++) {
        res.rates[i] = 0
      }

    }

    return res

  }

  /**
   * Addes information about user's reaction
   *
   * @this {Storage}
   * @param {string} domain - domain adress
   * @param {string} article - article ID
   * @param {string} user - user ID
   * @async
   * @return {Promise<void>}
   */
  public async addUserReaction (domain: string, article: string, user: string): Promise<void> {
    await this.database.insert(domain, this.makeUserReactionData(article, user, true))
  }

  /**
   * Returns number of the reaction selected by the user
   *
   * @this {Storage}
   * @param {string} domain - domain adress
   * @param {string} article - article ID
   * @param {string} user - user ID
   * @async
   * @return {Promise<number>} number of the reaction selected by the user
   */
  public async getUserReaction (domain: string, article: string, user: string): Promise<number> {

    try {

      const res = await this.database.find(domain, this.makeUserReactionData(article, user))
      return res[0].reaction

    } catch (e) {

      await this.addUserReaction(domain, article, user)
      return -1

    }

  }

  /**
   * Updates the number of the reaction selected by the user
   *
   * @this {Storage}
   * @param {string} domain - domain adress
   * @param {string} article - article ID
   * @param {string} user - user ID
   * @param {number} reaction - new number of the reaction selected by the user
   * @async
   * @private
   * @return {Promise<void>}
   */
  private async updateUserReaction (domain: string, article: string, user: string, reaction: number): Promise<void> {

    await this.database.update(
      domain,
      this.makeUserReactionData(article, user),
      { $set: { reaction: reaction } }
    )

  }

  /**
   * Removes information about user's reaction
   *
   * @this {Storage}
   * @param {string} domain - domain adress
   * @param {string} article - article ID
   * @param {string} user - user ID
   * @async
   * @return {Promise<void>}
   */
  public async removeUserReaction (domain: string, article: string, user: string): Promise<void> {

    await this.changeCounter(domain, article, user, -1)
    await this.database.remove(domain, this.makeUserReactionData(article, user))

  }

  /**
   * Checks whether the user exist in the database
   *
   * @this {Storage}
   * @param {string} domain - domain adress
   * @param {string} article - article ID
   * @param {string} user - user ID
   * @async
   * @return {boolean} true if user exists
   */
  public async isUserExists (domain: string, article: string, user: string): Promise<boolean> {
    const usersArray = await this.database.find(domain, this.makeUserReactionData(article, user))
    return usersArray.length > 0
  }

  /**
   * Returns speacial object contains information about reaction selected by user
   *
   * @this {Storage}
   * @param {string} article - article ID
   * @param {string} user - user ID
   * @param {boolean} [toInsert=false] - flag which indicates aim of the calling method
   * @private
   * @return {object}
   */
  private makeUserReactionData (article: string, user: string, toInsert: boolean= false): object {

    const res: any = {
      article: article,
      user: user
    }

    if (toInsert === true) {
      res.reaction = -1
    }

    return res

  }

  /**
   * Updates counters and user's reaction
   *
   * @this {Storage}
   * @param {string} domain - domain adress
   * @param {string} article - article ID
   * @param {string} user - user ID
   * @param {number} reaction - new reaction selected by the user
   * @async
   * @return {Promise<void>}
   */
  public async vote (domain: string, article: string, user: string, reaction: number): Promise<void> {

    await this.changeCounter(domain, article, user, reaction)
    await this.updateUserReaction(domain, article, user, reaction)

  }

}
