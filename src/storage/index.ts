import Database from './../database/index'
import ReactionsController from './../reactions-controller/index' 
import Reactions from './../reactions/index'
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
   * @async
   * @private
   * @return {Promise<void>}
   */
  private async addReactions(domainID: string, articleID: string): Promise<void> {

    const reactionsData = this.makeReactionsData(articleID, true)
    await this.database.insert(this.getReactionsCollectionName(domainID), reactionsData)
  
  }

  /**
   * Returns reactions object
   *
   * @this {Storage}
   * @param {string} domainID - domain's ID
   * @param {string} articleID - article's ID
   * @async
   * @return {Promise < Array<number> >}
   */
  public async getReactions(domainID: string, articleID: string): Promise<Reactions> {

    const reactionsData = this.makeReactionsData(articleID);
    const result = await this.database.find(this.getReactionsCollectionName(domainID), reactionsData)

    if (result.length > 0) {
      return result[0].reactions
    } else {
      await this.addReactions(domainID, articleID)
      return {}
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
    await this.database.remove(this.getReactionsCollectionName(domainID), reactionsData)
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
  private getReactionsCollectionName(domainID: string): string {
    return domainID + process.env.REACTIONS_PREFIX
  }
  
  
  /**
   * Return special object which contains information about counters
   *
   * @this {Storage}
   * @param {string} articleID - article's ID
   * @param {boolean} [toInsert = false] - flag which indicates aim of the calling method
   * @private
   * @return {object} information about counters
   */
  private makeReactionsData(articleID: string, toInsert: boolean = false): object {
    
    const result: any = {
      articleID: articleID
    }

    if (toInsert) {
      result.reactions = {}
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
  public async getUserReaction(domainID: string, articleID: string, userID: string): Promise<string> {

    const userReactionData = this.makeUserReactionData(articleID, userID)
    const result = await this.database.find(domainID, userReactionData)

    if (result.length > 0) {

      return result[0].emojiID
    
    } else {
      
      await this.addUserReaction(domainID, articleID, userID)
      return ''

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
    
    await this.vote(domainID, articleID, userID, '')
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
      result.emojiID = ''
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
   * @param {string} emojiID - ID of the emoji which selected by the user
   * @async
   * @return {Promise<void>}
   */
  public async vote(domainID: string, articleID: string, userID: string, emojiID: string): Promise<void> {

    const reactionsController = new ReactionsController(await this.getReactions(domainID, articleID))
    const oldEmojiID = await this.getUserReaction(domainID, articleID, userID)
    
    if (oldEmojiID !== '') {
      reactionsController.decrement(oldEmojiID)
    }

    if (emojiID !== '') {
      reactionsController.increment(emojiID)
    }

    await this.database.update(
      this.getReactionsCollectionName(domainID),
      this.makeReactionsData(articleID),
      {$set: {reactions: reactionsController.getReactions()}}
    )

    await this.database.update(
      domainID,
      this.makeUserReactionData(articleID, userID),
      {$set: {emojiID: emojiID}}
    )
    
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
    await this.database.removeCollection(this.getReactionsCollectionName(domainID))

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
