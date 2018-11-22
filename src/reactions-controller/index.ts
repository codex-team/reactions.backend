import Reactions from './../reactions/index'

/** Class which helps to controll reactions object */
export default class ReactionsController {

  /**
   * Object which contains emojies likes keys and rate like values
   *
   * @type {Reactions}
   * @private
   */
  private reactions: Reactions

  /**
   * Creates an instance of ReactionsController
   *
   * @this {ReactionsController}
   * @param {Reactions} reactions - reactions object to control
   */
  constructor (reactions: Reactions) {

    this.reactions = {};
    this.copy(reactions, this.reactions)
  
  }

  /**
   * Add value to the key emojiID
   *
   * @this {ReactionsController}
   * @param {string} emojiID - ID of the emoji
   * @param {number} toAdd - value to add
   * @private
   */
  private add(emojiID: string, toAdd: number) {
    
    if (this.reactions[emojiID] === undefined) {
      this.reactions[emojiID] = 0
    }

    this.reactions[emojiID] += toAdd

  }

  /**
   * Increments value for the key emojiID
   *
   * @this {ReactionsController}
   * @param {string} emojiID - ID of the emoji
   */
  public increment(emojiID: string) {
    this.add(emojiID, 1)
  }

  /**
   * Decrements value for the keu emojiID
   *
   * @this {ReactionsController}
   * @param {string} emojiID - ID of the emoji
   */
  public decrement(emojiID: string) {
    this.add(emojiID, -1)
  }

  /** 
   * Returns a copy of {this.reactions}
   *
   * @return {Reactions}
   */
  public getReactions(): Reactions {
  
    const res: Reactions = {}
    this.copy(this.reactions, res)
    return res

  }

  /**
   * Copies keys and values from {Reactions} to another
   *
   * @this {ReactionsController}
   * @param {object} from - from copy
   * @param {object} to - to copy
   * @private
   */
  private copy(from: Reactions, to: Reactions) {
    
    for (let each in from) {
      to[each] = from[each]
    }

  }

}
