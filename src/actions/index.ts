import Reactions from "../models/Reactions";

export class Actions {

    public getReactions(): Promise<Reactions> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(new Reactions('testId', 'testLabel', []));
            }, 1000);
        });

    };

    public saveReactions(reactions: Reactions): Promise<Reactions> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(new Reactions('testId', 'testLabel', []));
            }, 1000);
        });
    }

}