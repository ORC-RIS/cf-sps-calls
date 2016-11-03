"use strict"
var chai = require('chai')
var expect = chai.expect
var assert = chai.assert
chai.should();
chai.use(require('chai-as-promised'))
chai.use(require('chai-things'))

var util = require("../lib/util.js")

describe('Util', () => {
  describe('#readFileContent', () => {

    it('should read a file', () => {
      return expect(util.readFileContent('./util/hola.txt')).to.eventually.be.fulfilled
    })

    it('should return the file content', () => {
      return expect(util.readFileContent('./util/hola.txt')).to.eventually.be.equal("hola\n")
    })

  })
})
