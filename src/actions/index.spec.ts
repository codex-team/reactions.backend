import * as chai from 'chai';
import {Actions} from './index';
import Reactions from "../models/Reactions";

describe('Actions', () => {
    let actions: Actions;

    before(() => {
        actions = new Actions();
    });

    describe('Get reactions function', () => {
        it("should return promise of Reactions model", () => {
            return actions.getReactions(undefined)
                .then((reactions: Reactions) => {
                    chai.expect(reactions.id).to.eql('testId');
                    chai.expect(reactions.label).to.eql('testLabel');
                    chai.expect(reactions.reactions).to.be.an('array').that.is.empty;
                })
        });
    });

    describe('Save reactions function', () => {
        it("should return promise of Reactions model", () => {
            const reactionsToSave = new Reactions('testId', 'testLabel', []);

            return actions.saveReactions(reactionsToSave)
                .then((reactions: Reactions) => {
                    chai.expect(reactions.id).to.eql('testId');
                    chai.expect(reactions.label).to.eql('testLabel');
                    chai.expect(reactions.reactions).to.be.an('array').that.is.empty;
                })
        });
    });
});