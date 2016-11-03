/*
Look into a directory, analyze source code files and returns a json object with code metrics and relations.
*/
"use strict";
var fs = require('fs')
var path = require('path')
var decomment = require('decomment');
var recursive = require('recursive-readdir')
var util = require('./util.js')
var xml2js = require('xml2js')
var inspect = require('eyes').inspector({maxLength: false})
var cheerio = require('cheerio')
var htmlparser = require("htmlparser2")

var analysisResult = {
  path: '',
  files: [],
  metrics: {}
}

/*
  Clone object helper
*/
var clone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
}

var newAnalysisResult = () => {
  return clone(analysisResult)
}

var readdirPromise = (dirName) => {
  return new Promise((resolve, reject) => {
    recursive(dirName, function (err, files) {
      if (err) {
        reject(err)
        return
      }
      resolve(files)
    })
  })
}

var removeComments = (content) => {
  return new Promise((resolve, reject) => {

    // transform cfml comments into html comments
    var decommentedCode = content
      .replace(new RegExp('<!---', 'g'), '<!--')
      .replace(new RegExp('--->', 'g'), '-->')

    // remove html comments
    decommentedCode = decomment.html(decommentedCode)

    resolve(decommentedCode)
  })
}

var getIncludes = (dirName, content) => {
  return new Promise((resolve, reject) => {

    var includes = []

    // find coldfusion cfinclude tags
    var includeTags = content.match(/<cfinclude[\s\S]*?>/gm)

    if (includeTags) {
      includeTags.forEach(function(includeTag) {

        var re = / template="([^"]*)"/
        var matchResult = includeTag.match(re)
        if (matchResult) {
          var includeTemplate = matchResult[1]

          if (includeTemplate.charAt(0) !== '/')
            includeTemplate = path.join(path.dirname(dirName), includeTemplate)

/*
if (includeTemplate === "/adminmenu.cfm"){
  //console.log(dirName)
  console.log(includeTemplate)
//  console.log(path.dirname(dirName))
}*/

          // add each include template name to the currentFile includes list
          includes.push(includeTemplate)
        }
      })
    }

    resolve(includes)
  })
}

var analyzeFile = (filePath, dirName) => {
  return new Promise((resolve, reject) => {

    var currentFile = {
      file: filePath.replace(dirName, ""),
      includes: []
    }

    util.readFileContent(filePath)
      .then(content => removeComments(content))
      .then(content => getIncludes(currentFile.file, content))
      .then(includes => currentFile.includes = includes)
      .then(() => resolve(currentFile))

  })
}

// module functions
var analyze = function(dirName) {

  // analyze source code
  return new Promise((resolve, reject) => {

    // validate path
    fs.exists(dirName, (exists) => {
      if (!exists)
        reject('directory [foo] do not exists!')
      else {

        // initialize analysis result
        var result = newAnalysisResult()
        result.path = path.normalize(dirName)

        // read all files
        readdirPromise(dirName)
          .then(files => Promise.all(files.map(file => analyzeFile(file, result.path))))
          .then(data => {
            result.files = data
            resolve(result)
          })
      }
    })
  })
}


var parseXML = function(filePath) {

  // returns a new promise
  return new Promise((resolve, reject) => {

    /*
    var parser = new htmlparser.Parser({
      onopentag: function(name, attribs){
        console.log('opentag: ' + name)
        inspect(attribs)
      },
      ontext: function(text){
          console.log('text: ' + text)
      },
      onclosetag: function(name){
          console.log('closetag: ' + name)
      }},
      {decodeEntities: true})
  */


    util.readFileContent(filePath)
    .then(content => {

      var rawHtml = content;
      var handler = new htmlparser.DomHandler(function (error, dom) {
          if (error)
            console.log('ERROR - ' + error)
          else
              console.log(dom)
      })

      var parser = new htmlparser.Parser(handler, {withDomLvl1: false, decodeEntities: true, withStartIndices: true, });
      parser.write(rawHtml);
      parser.done();

      resolve('eze')
      //parser.write(content)
      //parser.end()

    })






    //var content = cheerio.load('<cfinclude template="file2.cfm" />')
/*
    util.readFileContent(filePath)
      .then(content => removeComments(content))
      .then(content => {
        var $ = cheerio.load(content)

        //var inner = $('cffunction').children()

        var inner = $.root()[0].serializeArray()

        //var inner = $.root()[0].childNodes
        console.log(inner)
        //inspect(cfml().each(item => console.log(item)))
        return 'eze'
      })
      .then(content => resolve(content))

*/
    /*
    util.readFileContent(filePath)
      .then(content => cheerio.load(content))
      .then(content => console.log(content))
      .then(content => content.root().toArray())
      .then(content => resolve(content))
    */


    //var parser = new xml2js.Parser({strict: false, async: true})

    //console.log(content.root().toArray())

    //resolve(content.root().toArray())

    /*
    // read and parse file
    util.readFileContent(filePath)
      //.then(content => removeComments(content))
      .then(content => {

        parser.parseString(content, (err, result) => {
          if (err) {
            reject(err)
          }
          else {
            resolve(result)
          }
        })

      })
      //.then(tokens => resolve(JSON.stringify(tokens)))
      //.then(content => resolve(content))
    */
  })
}


// exports
module.exports.newAnalysisResult = newAnalysisResult;
module.exports.analyze = analyze;
module.exports.parseXML = parseXML;
