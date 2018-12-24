import Reactions from '../models/Reactions';
import storage from '../storage';

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
   * Add user vote
   *
   * @param {string} domain - module`s domain
   * @param {Reactions} message
   *
   * @return {Reactions} - updated reactions
   */
  public static async vote (domain: string, message: Reactions): Promise<Reactions | undefined> {
    return storage.vote(domain, message.id, message.userId!, message.reaction!);
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
    return storage.unvote(domain, message.id, message.userId, message.reaction);
  }
}
