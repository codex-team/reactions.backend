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

  public async getCounters(domain: string, article: string) {
    const answerFromDb: Array<any> = await this.database.find(domain + '_counters', this.makeCountersData(article));
    return answerFromDb[0].rates;
  }

  public async addUserReaction(domain: string, article: string, user: string) {
    await this.database.insert(domain, this.makeUserReactionData(article, user, true));
  }

  public async getUserReaction(domain: string, article: string, user: string) {
    const res = await this.database.find(domain, this.makeUserReactionData(article, user));
    return res[0].reaction;
  }

  public async updateUserReaction(domain: string, article: string, user: string, reaction: number) {
    
    const rates = await this.getCounters(domain, article);
    const oldReaction = await this.getUserReaction(domain, article, user)
   
    if (oldReaction !== -1) {
      rates[oldReaction]--;
    }

    await this.database.update(domain + '_counters', this.makeCountersData(article), {$set: {rates: rates}});
    await this.database.update(domain, this.makeUserReactionData(article, user), {$set: {reaction: reaction}});
    
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

  private async addCounters(domain: string, article: string, reactions) {
    await this.database.insert(domain + '_counters', this.makeCountersData(article, true, reactions))
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

}
