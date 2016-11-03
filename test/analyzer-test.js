"use strict"

var chai = require('chai')
var expect = chai.expect
var assert = chai.assert
chai.should();
chai.use(require('chai-as-promised'))
chai.use(require('chai-things'))

var analyzer = require("../lib/analyzer.js")

describe('Analyzer', () => {
  describe('#analyze', () => {

    it('should reject a promise when the path do not exists', () => {
      return expect(analyzer.analyze('./test/analyzer/data/non-existent-directory')).to.eventually.be.rejected
    })

    it('should return empty json when the are no files to analyze', () => {
      var emptyResult = analyzer.newAnalysisResult()
      emptyResult.path = 'test/analyzer/data/empty-dir'
      return expect(analyzer.analyze('./test/analyzer/data/empty-dir')).to.eventually.deep.equal(emptyResult);
    })

    it('should return the name of analyzed directory as path property', () => {
      return expect(analyzer.analyze('./test/analyzer/data/empty-dir')).to.eventually
        .have.property('path')
        .and.is.equal('test/analyzer/data/empty-dir');
    })

    it('should analyze subdirectories', () => {
      return expect(analyzer.analyze('./test/analyzer/data/subdirectories')).to.eventually
        .have.property('files')
        .and.to.have.lengthOf(3)
    })

    it('should ignore any non cfml or cfc file', () => {
      return expect(analyzer.analyze('./test/analyzer/data/ignore-non-supported-files')).to.eventually.equal(null);
    })

    it('should avoid cfml comments', () => {

      return analyzer.analyze('./test/analyzer/data/cfml-comments')
        .then(result => {
          //console.log(result.files)

/*
          expect(result.files)
            .to.have.all.property('includes')
            .that.is.an('array')
*/


//[{ foo: [] }, { foo: [] }].should.all.have.property('foo').with.lengthOf(0)

            //expect(result.files).should.all.have.property('includes')//.with.length(0)
            //.be.empty
            //.with.lengthOf(0)
        })
    })

    it('should avoid js comments', () => {
      return expect(analyzer.analyze('./test/analyzer/data/js-comments')).to.eventually.equal(null)
    })

    it('should avoid html comments', () => {
      return expect(analyzer.analyze('./test/analyzer/data/html-comments')).to.eventually.equal(null)
    })

    it('should find any <cfinclude /> relation', () => {

      return analyzer.analyze('./test/analyzer/data/simple-cfinclude')
        .then(result => {
          //expect(result.files).should.all.contain.any.keys('includes')
          //.should.contain.a.thing.with.property('', 'cat')
          //expect(result.files[1].includes).to.equal('test/analyzer/data/simple-cfinclude');
        })
    })

    it('should have relative paths as files', () => {

      return analyzer.analyze('./test/analyzer/data/simple-cfinclude')
        .then(result => {
          expect(result.files[1].includes).to.include.one('3test/analyzer/data/simple-cfinclude')
          //expect(result.files[1].includes).to.equal('test/analyzer/data/simple-cfinclude');
        })
    })

    it('should support circular <cfinclude /> relations', () => {
      return expect(analyzer.analyze('./test/analyzer/data/circular-cfinclude')).to.eventually.equal(null)
    })

  })
})
