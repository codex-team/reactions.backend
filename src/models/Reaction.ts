/** Class representing single reaction. */
export default class Reaction {
    /** Reaction identifier. */
    private id: string;

    /** Count of votes for the reaction. */
    private voteCount: number;

    /** Unicode for emoji. */
    private iconUnicode: string;

    /**
     * Create a Reaction class.
     * @param {string} id - id of reaction.
     * @param {number} voteCount - count of votes for the reaction.
     * @param {string} iconUnicode - unicode for emoji.
     */
    constructor (
        id: string,
        voteCount: number,
        iconUnicode: string
    ) {
        this.id = id;
        this.voteCount = voteCount;
        this.iconUnicode = iconUnicode;
    }

}