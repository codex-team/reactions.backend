// import * as chai from 'chai';
// import chaiHttp from 'chai-http';
import app from '../src/server';
const chaiHttp = require('chai-http');
const chai = require('chai');

chai.use(chaiHttp);

describe('Server', () => {

    describe('Endpoints', () => {
        it("should return 200 for requests to root endpoint", () => {
            return chai.request(app).get('/')
                .then((res: any) => {
                    chai.expect(res.status).to.eql(200);
                })
        });

        it('should return 404 for requests to unhandled endpoints', () => {
            return chai.request(app).get('/something')
                .then((res: any) => {
                    chai.expect(res.status).to.eql(404);
                })
        });
    });
});