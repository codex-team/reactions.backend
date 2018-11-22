import Database from './../database/index'
import dotenv from 'dotenv'
dotenv.config({path: 'vars/database.env'})

/** Class which controls database */
export default class Storage {

  private database: Database

  /**
   * Creates an instance of the Storage
   *
   * @constructor
   * @this {Storage}
   * @param {string} [url=@see config.URL] - the database's server adress
   * @param {string} [dbName=@see config.DbName] - the name of the database
   */
  constructor (url: string = process.env.URL as string, dbName: string = process.env.DB_NAME as string) {
    this.database = new Database(url, dbName)
  }

  /**
   * Addes reactions in the database
   *
   * @this {Storage}
   * @param {string} domain - domain's adress
   * @param {string} article - article's ID
   * @param {number} [length = 0] - length of the reactions
   * @async
   * @private
   * @return {Promise<void>}
   */
  private async addReactions(domain: string, article: string, length: number = 0): Promise<void> {

    const reactionsData = this.makeReactionsData(article, length)
    await this.database.insert(this.getReactionsDomain(domain), reactionsData)
  
  }

  /**
   * Returns reactions array
   *
   * @this {Storage}
   * @param {string} domain - domain's adress
   * @param {string} article - article's ID
   * @async
   * @return {Promise < Array<number> >}
   */
  public async getReactions(domain: string, article: string): Promise< Array<number> > {

    const reactionsData = this.makeReactionsData(article);
    const result = await this.database.find(this.getReactionsDomain(domain), reactionsData)

    if (result.length > 0) {
      return result[0].reactions
    } else {
      await this.addReactions(domain, article)
      return []
    }
  
  }

  /**
   * Removes reactions and users
   *
   * @this {Storage}
   * @param {string} domain - domain's adress
   * @param {string} article - article's ID
   * @async
   * @return {Promise<void>}
   */
  public async removeReactions(domain: string, article: string): Promise<void> {

    const reactionsData = this.makeReactionsData(article);
    await this.database.remove(this.getReactionsDomain(domain), reactionsData)
    await this.database.remove(domain, reactionsData)
  
  }
  
  /**
   * Returns name of the reactions collection
   *
   * @this {Storage}
   * @param {string} domain - domain's adress
   * @private
   * @return {string} - name of the reactions collection
   */
  private getReactionsDomain(domain: string): string {
    return domain + process.env.REACTIONS_PREFIX
  }
  
  
  /**
   * Return special object which contains information about counters
   *
   * @this {Storage}
   * @param {string} article - article's ID
   * @param {number} [length = 0] - amount of the reactions
   * @private
   * @return {object} information about counters
   */
  private makeReactionsData(article: string, length: number = 0): object {
    
    const result: any = {
      article: article
    }
    
    if (length > 0) {
      result.reactions = new Array<number>(length)
    }

    return result

  }

  /**
   * Addes user's reaction
   *
   * @this {Storage}
   * @param {string} domain - domain's adress
   * @param {string} article - article's ID
   * @param {string} user - user's ID
   * @async
   * @private
   * @return {Promise<void>}
   */
  private async addUserReaction(domain: string, article: string, user: string): Promise<void> {

    const userReactionData = this.makeUserReactionData(article, user, true)
    await this.database.insert(domain, userReactionData)
  
  }

  /**
   * Returns number of the reaction selected by the user or -1 if user didn't select
   *
   * @this {Storage}
   * @param {string} domain - domain's adress
   * @param {string} article - article's ID
   * @param {string} user - user's ID
   * @async
   * @return {Promise<number>} - number of the reaction
   */
  public async getUserReaction(domain: string, article: string, user: string): Promise<number> {

    const result = ( await this.database.find(domain, {article: article, user: user}) )

    if (result.length > 0) {

      return result[0].index
    
    } else {
      
      await this.addUserReaction(domain, article, user)
      return -1

    }
  
  }

  /**
   * Removes user's reaction
   *
   * @this {Storage}
   * @param {string} domain - domain's adress
   * @param {string} article - article's ID
   * @param {string} user - user's ID
   * @async
   * @return {Promise<void>}
   */
  public async removeUserReaction(domain: string, article: string, user: string): Promise<void> {
    
    await this.vote(domain, article, user, -1)
    await this.database.remove(domain, this.makeUserReactionData(article, user))
  
  }

  /**
   * Returns speacial object contains information about reaction selected by user
   *
   * @this {Storage}
   * @param {string} article - article's ID
   * @param {string} user - user's ID
   * @param {boolean} [toInsert = false] - flag which indicates aim of the calling method
   * @private
   * @return {object}
   */
  private makeUserReactionData(article: string, user: string, toInsert: boolean = false): object {
    
    const result: any = {
      article: article,
      user: user
    }

    if (toInsert) {
      result.index = -1
    }

    return result

  }

  /**
   * Updates reactions and user's choice
   *
   * @this {Storage}
   * @param {string} domain - domain's adress
   * @param {string} article - article's ID
   * @param {stirng} user - user's ID
   * @param {number} index - number of the selected reaction
   * @async
   * @return {Promise<void>}
   */
  public async vote(domain: string, article: string, user: string, index: number): Promise<void> {

    const reactions = await this.getReactions(domain, article)
    const oldIndex = await this.getUserReaction(domain, article, user)

    if (oldIndex !== -1) {
      reactions[oldIndex]--
    }

    this.fixArray(reactions, index)
    if (index !== -1) {
      reactions[index]++
    }

    await this.database.update(
      this.getReactionsDomain(domain),
      this.makeReactionsData(article),
      {$set: {reactions: reactions}}
    )

    await this.database.update(
      domain,
      this.makeUserReactionData(article, user),
      {$set: {index: index}}
    )
    
  }

  /**
   * Fixes array's length if it's necessary
   *
   * @this {Storage}
   * @param {Array<number>} array - array to fix
   * @param {number} index - index of the array
   * @private
   */
  private fixArray(array: Array<number>, index: number) {
    
    for (let i = array.length; i <= index; i++) {
      array.push(0)
    }
  
  }

  /**
   * Return array of users
   *
   * @this {Storage}
   * @param {string} domain - domain's adress
   * @param {string} article - article's ID
   * @async
   * @return {Promise< Array<string> >} - users
   */
  public async getUsers(domain: string, article: string): Promise< Array<string> > {

    const result = new Array<string>()
    const users = ( await this.database.find(domain, {article: article}) )

    for (let i = 0; i < users.length; i++) {
      result.push(users[i].user)
    }

    return result
  
  }

  /**
   * Removes domain
   *
   * @this {Storage}
   * @param {string} domain - domain's adress
   * @async
   * @return {Promise<void>}
   */
  public async removeDomain (domain: string) {
    await this.database.removeCollection(domain)
  }

  /**
   * Clears storage
   *
   * @this {Storage}
   * @async
   * @return {Promise<void>}
   */
  public async clearStorage () {
    await this.database.reset()
  }

}
