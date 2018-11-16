import Database from './../database/index'

const standartUrl = 'mongodb://localhost:27017'
const standartDbName = 'reactions'
const countersCollectionName = 'counters'

export default class Storage {

  private database: Database;

  constructor(url: string=standartUrl, dbName: string=standartDbName) {
    this.database = new Database(url, dbName);
  }

  public async addArticle(domain: string, article: string, reactions: number) {
    await this.addCounters(domain, article, reactions);
  }

  public async removeArticle(domain: string, article: string) {
    await this.removeCounters(domain, article);
  }

  private async addCounters(domain: string, article: string, reactions: number) {
    await this.database.insert(domain + '_counters', this.makeCountersData(article, true, reactions))
  }

  public async getCounters(domain: string, article: string) {
    
    try {
      
      const answerFromDb = await this.database.find(domain + '_counters', this.makeCountersData(article));
      return answerFromDb[0].rates;
    
    } catch (e) {

      console.log('Article on this domain is not exist');
      return null;
    
    }

  }

  private async removeCounters(domain: string, article: string) {
    await this.database.remove(domain + '_counters', this.makeCountersData(article));
  }

  private makeCountersData(article: string, toInsert: boolean=false, reactions: number=0) {
    
    const res: any =  {
      article: article,
    }

    if (toInsert === true) {
      
      res.rates = new Array<number>(reactions);
      
      for (let i = 0; i < reactions; i++) {
        res.rates[i] = 0;
      }

    }

    return res;

  }

  public async addUserReaction(domain: string, article: string, user: string) {
    await this.database.insert(domain, this.makeUserReactionData(article, user, true));
  }

  public async getUserReaction(domain: string, article: string, user: string) {
    
    try {

      const res = await this.database.find(domain, this.makeUserReactionData(article, user));
      return res[0].reaction;
    
    } catch (e) {

      await this.addUserReaction(domain, article, user);
      return -1;
    
    }

  }

  public async updateUserReaction(domain: string, article: string, user: string, reaction: number) {
    
    const rates = await this.getCounters(domain, article);
    const oldReaction = await this.getUserReaction(domain, article, user);

    if (oldReaction !== -1) {
      rates[oldReaction]--;
    }

    await this.database.update(domain + '_counters', this.makeCountersData(article), {$set: {rates: rates}});
    await this.database.update(domain, this.makeUserReactionData(article, user), {$set: {reaction: reaction}});
    
  }

  public async removeUserReaction(domain: string, article: string, user: string) {
    await this.database.remove(domain, this.makeUserReactionData(article, user));
  }

  public async isUserExist(domain: string, article: string, user: string) {
    const usersArray = await this.database.find(domain, this.makeUserReactionData(article, user))
    return usersArray.length > 0
  }

  private makeUserReactionData(article: string, user: string, toInsert: boolean=false) {
    
    const res: any = {
      article: article,
      user: user,
    }

    if (toInsert === true) {
      res.reaction = -1
    }

    return res;

  }

}
