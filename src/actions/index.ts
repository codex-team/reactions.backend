import Reactions from "../models/Reactions";

/** Class aggregating an application business logic. */
export class Actions {

    /**
     * Return Reactions by id.
     * @param {any} id - id of requested reactions.
     * @return {Promise<Reactions>} promise emitting reactions.
     */
    public getReactions(id: any): Promise<Reactions> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(new Reactions('testId', 'testLabel', []));
            }, 1000);
        });

    };

    /**
     * Save Reactions.
     * @param {Reactions} reactions - reactions to save.
     * @return {Promise<Reactions>} promise emitting reactions.
     */
    public saveReactions(reactions: Reactions): Promise<Reactions> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(new Reactions('testId', 'testLabel', []));
            }, 1000);
        });
    }

}