/** Class representing reactions. */
export default class Reactions {
  /** Reactions identifier. */
  public readonly id: string;

  /** Reactions text. */
  public readonly title?: string;

  /** Collection of appended reactions. */
  public readonly options?: {[code: string]: number};

  /**
   * Hash of voted reaction
   */
  public reaction?: number;

  /**
   * Id of user who has voted
   */
  public userId?: string;

  /**
   * Create a Reactions class.
   * @param {string} id - id of reactions.
   * @param {string} title - reactions text.
   * @param options
   */
  constructor (
    id: string,
    title: string = '',
    options: {[code: string]: number} = {}
   ) {
    this.id = id;
    this.title = title;
    this.options = options;
  }
}
