"use strict"
var chai = require('chai')
var expect = chai.expect
var assert = chai.assert
chai.should();
chai.use(require('chai-as-promised'))
chai.use(require('chai-things'))

var docEngine = require("../lib/doc-engine.js")

describe('DocEngine', () => {
  describe('#getMetadata', () => {

    it('should return something', () => {
      return expect(docEngine.getMetadata('./util/hola.txt')).to.eventually.be.fulfilled
    })

  })
})
