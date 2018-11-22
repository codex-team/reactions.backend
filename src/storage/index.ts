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
   * @param {string} domainID - domain's ID
   * @param {string} articleID - article's ID
   * @param {number} [length = 0] - length of the reactions
   * @async
   * @private
   * @return {Promise<void>}
   */
  private async addReactions(domainID: string, articleID: string, length: number = 0): Promise<void> {

    const reactionsData = this.makeReactionsData(articleID, length)
    await this.database.insert(this.getReactionsDomain(domainID), reactionsData)
  
  }

  /**
   * Returns reactions array
   *
   * @this {Storage}
   * @param {string} domainID - domain's ID
   * @param {string} articleID - article's ID
   * @async
   * @return {Promise < Array<number> >}
   */
  public async getReactions(domainID: string, articleID: string): Promise< Array<number> > {

    const reactionsData = this.makeReactionsData(articleID);
    const result = await this.database.find(this.getReactionsDomain(domainID), reactionsData)

    if (result.length > 0) {
      return result[0].reactions
    } else {
      await this.addReactions(domainID, articleID)
      return []
    }
  
  }

  /**
   * Removes reactions and users
   *
   * @this {Storage}
   * @param {string} domainID - domain's ID
   * @param {string} articleID - article's ID
   * @async
   * @return {Promise<void>}
   */
  public async removeReactions(domainID: string, articleID: string): Promise<void> {

    const reactionsData = this.makeReactionsData(articleID);
    await this.database.remove(this.getReactionsDomain(domainID), reactionsData)
    await this.database.remove(domainID, reactionsData)
  
  }
  
  /**
   * Returns name of the reactions collection
   *
   * @this {Storage}
   * @param {string} domainID - domain's ID
   * @private
   * @return {string} - name of the reactions collection
   */
  private getReactionsDomain(domainID: string): string {
    return domainID + process.env.REACTIONS_PREFIX
  }
  
  
  /**
   * Return special object which contains information about counters
   *
   * @this {Storage}
   * @param {string} articleID - article's ID
   * @param {number} [length = 0] - amount of the reactions
   * @private
   * @return {object} information about counters
   */
  private makeReactionsData(articleID: string, length: number = 0): object {
    
    const result: any = {
      articleID: articleID
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
   * @param {string} domainID - domain's ID
   * @param {string} articleID - article's ID
   * @param {string} userID - user's ID
   * @async
   * @private
   * @return {Promise<void>}
   */
  private async addUserReaction(domainID: string, articleID: string, userID: string): Promise<void> {

    const userReactionData = this.makeUserReactionData(articleID, userID, true)
    await this.database.insert(domainID, userReactionData)
  
  }

  /**
   * Returns number of the reaction selected by the user or -1 if user didn't select
   *
   * @this {Storage}
   * @param {string} domainID - domain's ID
   * @param {string} articleID - article's ID
   * @param {string} userID - user's ID
   * @async
   * @return {Promise<number>} - number of the reaction
   */
  public async getUserReaction(domainID: string, articleID: string, userID: string): Promise<number> {

    const userReactionData = this.makeUserReactionData(articleID, userID)
    const result = await this.database.find(domainID, userReactionData)

    if (result.length > 0) {

      return result[0].index
    
    } else {
      
      await this.addUserReaction(domainID, articleID, userID)
      return -1

    }
  
  }

  /**
   * Removes user's reaction
   *
   * @this {Storage}
   * @param {string} domainID - domain's ID
   * @param {string} articleID - article's ID
   * @param {string} userID - user's ID
   * @async
   * @return {Promise<void>}
   */
  public async removeUserReaction(domainID: string, articleID: string, userID: string): Promise<void> {
    
    await this.vote(domainID, articleID, userID, -1)
    await this.database.remove(domainID, this.makeUserReactionData(articleID, userID))
  
  }

  /**
   * Returns speacial object contains information about reaction selected by user
   *
   * @this {Storage}
   * @param {string} articleID - article's ID
   * @param {string} userID - user's ID
   * @param {boolean} [toInsert = false] - flag which indicates aim of the calling method
   * @private
   * @return {object}
   */
  private makeUserReactionData(articleID: string, userID: string, toInsert: boolean = false): object {
    
    const result: any = {
      articleID: articleID,
      userID: userID
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
   * @param {string} domainID - domain's ID
   * @param {string} articleID - article's ID
   * @param {stirng} userID - user's ID
   * @param {number} index - number of the selected reaction
   * @async
   * @return {Promise<void>}
   */
  public async vote(domainID: string, articleID: string, userID: string, index: number): Promise<void> {

    const reactions = await this.getReactions(domainID, articleID)
    const oldIndex = await this.getUserReaction(domainID, articleID, userID)

    if (oldIndex !== -1) {
      reactions[oldIndex]--
    }

    this.fixArray(reactions, index)
    if (index !== -1) {
      reactions[index]++
    }

    await this.database.update(
      this.getReactionsDomain(domainID),
      this.makeReactionsData(articleID),
      {$set: {reactions: reactions}}
    )

    await this.database.update(
      domainID,
      this.makeUserReactionData(articleID, userID),
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
   * @param {string} domain - domain's ID
   * @param {string} article - article's ID
   * @async
   * @return {Promise< Array<string> >} - array of IDs for each user
   */
  public async getUsersID(domainID: string, articleID: string): Promise< Array<string> > {

    const result = new Array<string>()
    const users = ( await this.database.find(domainID, {articleID: articleID}) )

    for (let i = 0; i < users.length; i++) {
      result.push(users[i].user)
    }

    return result
  
  }

  /**
   * Removes domain
   *
   * @this {Storage}
   * @param {string} domain - domain's ID
   * @async
   * @return {Promise<void>}
   */
  public async removeDomain (domainID: string): Promise<void> {

    await this.database.removeCollection(domainID)
    await this.database.removeCollection(this.getReactionsDomain(domainID))

  }


  /**
   * Clears storage
   *
   * @this {Storage}
   * @async
   * @return {Promise<void>}
   */
  public async clear (): Promise<void> {
    await this.database.reset()
  }

}
