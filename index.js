/*
  Given a directory inspects all the .cfm and .cfc files and return a json object
  with a list of files and dependencies.
*/
"use strict";
var fs = require('fs')
var analyzer = require("./lib/analyzer.js")
var cytoscape = require("./lib/cytoscape-format.js")
var vis = require("./lib/visjs-format.js")
var docEngine = require("./lib/doc-engine.js")
var inspect = require('eyes').inspector({maxLength: false})

// promise config
var Promise = require("bluebird")
Promise.onPossiblyUnhandledRejection(error => {
  throw error
})

var save = (data, fileName) => {
  return new Promise((resolve, reject) => {

    var jsonData = "includes = " + JSON.stringify(data)

    fs.writeFile(fileName, jsonData, function(err) {
      if(err) {
          reject(err)
      }
      resolve()
    })
  })
}

//TODO: validate app parameters
//var directoryToAnalyze = process.argv[2]
//console.log(directoryToAnalyze)

/*
analyzer
  .analyze(directoryToAnalyze)
    .then(result => vis.format(result))
    //.then(result => console.log(JSON.stringify(result)))
    .then(visData => save(visData, 'dataset.js'))
    //.then(() => console.log('exit'))

*/

/*
1. get json metadata, http GET
2. generate MD
  2.1 create 1 file per component in metadata
3. generate HTML
*/
/*
var docEngine = null
docEngine.getMetadata()
  .then(metadata => generateMD(metadata))
  .then(mdFiles => generateHTML(mdFiles))
*/

analyzer
  .parseXML('./test/data.xml')
  //.then(content => console.log(content))


//docEngine.getMetadata('./components-data-3.js')
//  .then(metadata => docEngine.generateHTML(metadata))
  //.then(metadata => console.log(metadata))
  //.catch(err => console.log(err))
