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
  private databaseName: string

  /**
   * Creates an instance of Database
   *
   * @this {Database}
   * @param {string} url - mongodb adress
   * @constructor
   */
  constructor (url: string, databaseName: string) {
    this.connection = MongoClient.connect(url, { useNewUrlParser: true })
    this.databaseName = databaseName
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

      const db = (await this.connection).db(this.databaseName)
      return db.collection(collection)

    } catch (e) {

      console.log('Database server is unaviable: ' + e.message)
      return undefined

    }

  }

  /**
   * Inserts elements in the database
   *
   * @this {Database}
   * @param {string} collectionsName - name of the collection
   * @param {...object} elements - elements are need to be inserted
   * @param {Promise<void>} Promise without returning value
   */
  public async insert (collectionsName: string, ...elements: object[]): Promise<void> {
    const collection = await this.getCollection(collectionsName)
    collection.insertMany(query)
  }

  /**
   * Finds elements in the database
   *
   * @this {Database}
   * @param {string} collectionsName - name of the collection
   * @param {object} query - filter for the collection
   * @returns {Promise< Array<object> >} Array of the finding objects
   */
  public async find (collectionsName: string, query: object= {}): Promise< Array<object> > {
    const collection = await this.getCollection(collectionsName)
    return collection.find(query).toArray()
  }

  /**
   * Updates elements in the database
   *
   * @this {Database}
   * @param {string} collectionsName - name of the collection
   * @param {object} query - filter for the collection
   * @param {object} updater - rules for the update
   * @returns {Promise<void>} Promise without returning value
   */
  public async update (collectionsName: string, query: object, updater: object): Promise<void> {
    const collection = await this.getCollection(collectionsName)
    collection.updateMany(query, updater)
  }

  /**
   * Removes elements in the database
   *
   * @this {Database}
   * @param {string} collectionsName - name of the collection
   * @param {object} query - filter for the collection
   * @returns {Promise<void>} Promise without returning value
   */
  public async remove (collectionsName: string, query: object): Promise<void> {
    const collection = await this.getCollection(collectionsName)
    collection.remove(query)
  }

}
