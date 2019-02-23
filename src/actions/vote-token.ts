import storage from '../storage';

export interface UserToken {
  user: string;
  startDate: Date;
  _id: string;
}

/** Class responsible for vote token. */
export default class VoteTokenActions {
  /**
   * Return token by domain and user id.
   * @param {string} domain - module`s domain
   * @param {string} userId - user id
   *
   * @return {Promise<string | undefined>} token.
   */
  public static async get (domain: string, userId: string): Promise<string | undefined> {
    let token = await storage.getUserToken(domain, userId);

    if (!token
      || new Date(token.startDate.getTime() + Number(process.env.TOKEN_LIFETIME_IN_MINUTES) * 60000) < new Date()) {
      token = await storage.insertUserToken(domain, userId);
    }

    return token._id;
  }

  /**
   * Check is token exist and valid.
   * @param {string} domain - module`s domain
   * @param {string} userId - user id
   * @param {string} token - token id
   *
   * @return {Promise<string | undefined>} token.
   */
  public static async check (domain: string, userId: string, token: string): Promise<boolean> {
    const lastToken = await storage.getUserToken(domain, userId!);

    return lastToken && lastToken._id.toString() === token
      && new Date(lastToken.startDate.getTime() + Number(process.env.TOKEN_LIFETIME_IN_MINUTES) * 60000) > new Date();
  }
}
