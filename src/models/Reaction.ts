export default class Reaction {
    private id: string;
    private voteCount: number;
    private iconUnicode: string;

    constructor(id: string,
                voteCount: number,
                iconUnicode: string) {
        this.id = id;
        this.voteCount = voteCount;
        this.iconUnicode = iconUnicode;
    }

}