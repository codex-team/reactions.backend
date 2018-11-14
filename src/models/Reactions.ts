import Reaction from "./Reaction";

export default class Reactions {
    public readonly id: string;
    public readonly label: string;
    public readonly reactions: Reaction[];
    public readonly votedReactionId?: number;

    constructor (
        id: string,
        label: string,
        reactions: Reaction[],
        votedReactionId?: number
    ) {
        this.id = id;
        this.label = label;
        this.reactions = reactions;
        this.votedReactionId = votedReactionId;
    }
}