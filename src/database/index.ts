import { MongoClient, Collection } from 'mongodb'

/** Database wrapper */
export default class Database {

  /**
   * Promise which connects to the mongodb server
   *
   * @type {Promise<MongoClient>}
   * @private
   */
  private connection: Promise<MongoClient>

  /**
   * Name of the database
   *
   * @type {string}
   * @private
   */
  private dbName: string

  /**
   * Creates an instance of Database
   *
   * @this {Database}
   * @param {string} url - mongodb adress
   * @constructor
   */
  constructor (url: string, dbName: string) {
    this.connection = MongoClient.connect(url, { useNewUrlParser: true })
    this.dbName = dbName
  }

  /**
   * Returns the collection promise from the mongodb server
   *
   * @this {Database}
   * @param {string} collection - name of the collection what user needs
   * @private
   */
  private async getCollection (collection: string): Promise<Collection> {

    try {

      const db = (await this.connection).db(this.dbName)
      return db.collection(collection)

    } catch (e) {

      throw e

    }

  }

  /**
   * Inserts elements in the database
   *
   * @this {Database}
   * @param {string} collectionName - name of the collection
   * @param {...object} elements - elements are need to be inserted
   * @param {Promise<void>} Promise without returning value
   */
  public async insert (collectionName: string, ...elements: object[]): Promise<void> {

    try {

      const collection = await this.getCollection(collectionName)
      await collection.insertMany(elements)

    } catch (e) {

      throw e

    }

  }

  /**
   * Finds elements in the database
   *
   * @this {Database}
   * @param {string} collectionName - name of the collection
   * @param {object} query - filter for the collection
   * @returns {Promise< Array<object> >} Array of the finding objects
   */
  public async find (collectionName: string, query: object= {}): Promise< Array<any> > {

    try {

      const collection = await this.getCollection(collectionName)
      return collection.find(query).toArray()

    } catch (e) {

      throw e
    }
  }

  /**
   * Updates elements in the database
   *
   * @this {Database}
   * @param {string} collectionName - name of the collection
   * @param {object} query - filter for the collection
   * @param {object} updater - rules for the update
   * @returns {Promise<void>} Promise without returning value
   */
  public async update (collectionName: string, query: object, updater: object): Promise<void> {

    try {

      const collection = await this.getCollection(collectionName)
      await collection.updateMany(query, updater)

    } catch (e) {

      throw e

    }
  }

  /**
   * Removes elements in the database
   *
   * @this {Database}
   * @param {string} collectionName - name of the collection
   * @param {object} query - filter for the collection
   * @returns {Promise<void>} Promise without returning value
   */
  public async remove (collectionName: string, query: object): Promise<void> {

    try {

      const collection = await this.getCollection(collectionName)
      await collection.deleteMany(query)

    } catch (e) {

      throw e

    }
  }

}
