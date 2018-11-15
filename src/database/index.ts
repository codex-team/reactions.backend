import {MongoClient} from 'mongodb';

const standartUrl = 'mongodb://localhost:27017/reactions';

export default class Database {

  private client: MongoClient;
  private connection: any;
  private db: any;

  constructor(url: string=standartUrl) {
    this.connection = MongoClient.connect(url);
  }

  private async getCollection(collection) {
    try {
      const db = await this.connection;
      return db.collection(collection);
    } catch (e) {
      console.log('Database server is unaviable');
      return undefined;
    }
  }

  public async find(domain: string, articleID: string, userID: string) {
    
    const objectToFind = {
      articleID: articleID,
      userID: userID
    };

    try {

      const collection = await this.getCollection(domain)

      if (collection !== undefined) {
        return collection.find(objectToFind);
      } else {
        throw new Error();
      }
    
    } catch (e) {
      console.log('Server doesn\'t have data at this adress');
      return undefined;
    }

  }

}

const db = new Database();
db.find('1', '2', '3');

