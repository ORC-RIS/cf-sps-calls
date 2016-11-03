"use strict"
//var chai = require('chai')
//var expect = chai.expect
//var assert = chai.assert
//chai.should();
//chai.use(require('chai-as-promised'))
//chai.use(require('chai-things'))

var inspect = require('eyes').inspector({maxLength: false})

var CfmlHandler = require("./../lib/cfml-parser/cfml-handler.js")
var htmlparser = require("htmlparser2")

describe('fmlParserHandler', () => {
  describe('#test', () => {

    it('should do something', () => {

      var rawHtml = '<!-- hola/n hjhj /n -->/n<cfalgo hola="chau">'
      var handler = new CfmlHandler(function (error, dom) {
          if (error)
            console.log(error)
          else
            console.log('ok!')
      });

      var parser = new htmlparser.Parser(handler);

      parser.write(rawHtml);
      //parser.write({line: 1, code: '<h1>chau</h1>'});
      //parser.write({line: 2, code: '<p>hola</p>'});
      parser.done();

    })

  })
})
