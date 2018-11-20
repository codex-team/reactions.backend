import Database from './../database/index'
import dotenv from 'dotenv'
dotenv.config({path: 'vars/database.env'})

export default class Storage {

  private database: Database

  constructor (url: string = process.env.URL as string, dbName: string = process.env.DB_NAME as string) {
    this.database = new Database(url, dbName)
  }

  private async addReactions(domain: string, article: string, length: number = 0): Promise<void> {

    const reactionsData = this.makeReactionsData(article, length)
    await this.database.insert(this.getReactionsDomain(domain), reactionsData)
  
  }

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

  public async removeReactions(domain: string, article: string): Promise<void> {

    const reactionsData = this.makeReactionsData(article);
    await this.database.remove(this.getReactionsDomain(domain), reactionsData)
    await this.database.remove(domain, reactionsData)
  
  }

  private getReactionsDomain(domain: string): string {
    return domain + process.env.REACTIONS_PREFIX
  }

  private makeReactionsData(article: string, length: number = 0): object {
    
    const result: any = {
      article: article
    }
    
    if (length > 0) {
      result.reactions = new Array<number>(length)
    }

    return result

  }

  private async addUserReaction(domain: string, article: string, user: string): Promise<void> {

    const userReactionData = this.makeUserReactionData(article, user, true)
    await this.database.insert(domain, userReactionData)
  
  }

  public async getUserReaction(domain: string, article: string, user: string): Promise<number> {

    const result = ( await this.database.find(domain, {article: article, user: user}) )

    if (result.length > 0) {

      return result[0].index
    
    } else {
      
      await this.addUserReaction(domain, article, user)
      return -1

    }
  
  }

  public async removeUserReaction(domain: string, article: string, user: string): Promise<void> {
    
    await this.vote(domain, article, user, -1)
    await this.database.remove(domain, this.makeUserReactionData(article, user))
  
  }

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

  public async vote(domain: string, article: string, user: string, index: number): Promise<void> {

    const reactions = await this.getReactions(domain, article)
    const oldIndex = await this.getUserReaction(domain, article, user)

    if (oldIndex !== -1) {
      reactions[oldIndex]--
    }

    this.checkArray(reactions, index)
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

  private checkArray(array: Array<number>, index: number) {
    
    for (let i = array.length; i <= index; i++) {
      array.push(0)
    }
  
  }

  public async getUsers(domain: string, article: string): Promise< Array<string> > {

    const result = new Array<string>()
    const users = ( await this.database.find(domain, {article: article}) )

    for (let i = 0; i < users.length; i++) {
      result.push(users[i].user)
    }

    return result
  
  }

}
