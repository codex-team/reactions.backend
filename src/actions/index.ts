import Reactions from '../models/Reactions';
import storage from '../storage';
import { TOKEN_LIFETIME_IN_MINUTES } from '../constants/token';

export interface UserToken {
  user: string;
  startDate: Date;
  _id: string;
}

/** Class aggregating an application business logic. */
export default class Actions {

  /**
   * Return Reactions by domain and id.
   * @param {string} domain - module`s domain
   * @param {Reactions} message
   *
   * @return {Promise<Reactions | undefined>} reactions.
   */
  public static async getReactions (domain: string, message: Reactions): Promise<Reactions | undefined> {
    const reactions = new Reactions(message.id, message.title, message.options);
    const dbResult = await storage.getReactions(domain, reactions);

    if (dbResult && message.userId) {
      const userReaction = await storage.getUserReaction(domain, message.id, message.userId);

      if (userReaction && userReaction in message.options!) {
        dbResult.reaction = userReaction;
      }

      dbResult.userId = message.userId;
    }

    return dbResult;
  }

  /**
   * Return Reactions by domain and id.
   * @param {string} domain - module`s domain
   * @param {string} userId
   *
   * @return {Promise<string | undefined>} token.
   */
  public static async getToken (domain: string, userId: string): Promise<string | undefined> {
    let token = await storage.getUserToken(domain, userId);
    if (!token || new Date(token.startDate.getTime() + TOKEN_LIFETIME_IN_MINUTES * 60000) < new Date()) {
      token = await storage.insertUserToken(domain, userId);
    }
    console.log('token \n', token);

    return token._id;
  }

  /**
   * Add user vote
   *
   * @param {string} domain - module`s domain
   * @param {Reactions} message
   *
   * @return {Reactions} - updated reactions
   */
  public static async vote (domain: string, message: any): Promise<Reactions | undefined> {
    const token = await storage.getUserToken(domain, message.userId!);
    if (token
      && token._id.toString() === message.token
      && new Date(token.startDate.getTime() + TOKEN_LIFETIME_IN_MINUTES * 60000) > new Date()) {
      return storage.vote(domain, message.id, message.userId!, message.reaction!);
    }
  }

  /**
   * Remove user vote
   *
   * @param {string} domain - module`s domain
   * @param {Reactions} message
   *
   * @return {Reactions} - updated reactions
   */
  public static async unvote (domain: string, message: any): Promise<Reactions | undefined> {
    const token = await storage.getUserToken(domain, message.userId!);
    if (token
      && token._id.toString() === message.token
      && new Date(token.startDate.getTime() + TOKEN_LIFETIME_IN_MINUTES * 60000) > new Date()) {
      return storage.unvote(domain, message.id, message.userId, message.reaction);
    }
  }
}
