import Reaction from "./Reaction";

/** Class representing reactions. */
export default class Reactions {
    /** Reactions identifier. */
    public readonly id: string;

    /** Reactions text. */
    public readonly label: string;

    /** Collection of appended reactions. */
    public readonly reactions: Reaction[];

    /** Flag indicating vote of specific user. */
    public readonly votedReactionId?: number;

    /**
     * Create a Reactions class.
     * @param {string} id - id of reactions.
     * @param {string} label - reactions text.
     * @param {Reaction[]} reactions - collection of appended reactions.
     * @param {number} votedReactionId - flag indicating vote of specific user.
     */
    constructor(
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