import cronJob, { CronJob } from 'cron';
import VoteTokenActions from './vote-token';

/** Class responsible for cron jobs. */
export class CronJobActions {
  /** Delete expired token every day. */
  public userTokenDeletionCron: CronJob;

  /**
   * Creates an instance of the CronJobActions
   *
   * @constructor
   * @this {CronJobActions}
   */
  constructor () {
    this.userTokenDeletionCron = new cronJob.CronJob('59 59 23 * * *', VoteTokenActions.deleteExpiredTokens, undefined, true, 'Europe/Moscow');
  }
}
