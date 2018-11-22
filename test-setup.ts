import sinon from "sinon";
import chai from "chai";
const chai = require('chai')
const sinonChai = require('sinon-chai')

before(function () {
    chai.use(sinonChai)
})

beforeEach(function () {
    this.sandbox = sinon.sandbox.create()
})

afterEach(function () {
    this.sandbox.restore()
})