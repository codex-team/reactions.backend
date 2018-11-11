import Reactions from "../models/Reactions";

export const getReactions = () : Promise<Reactions> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(new Reactions('testId', 'testLabel', []));
        },1000);
    });
};