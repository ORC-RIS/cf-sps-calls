/*
  Given a directory inspects all the .cfm and .cfc files and return a json object
  with a list of files and dependencies.
*/
"use strict";
var fs = require('fs')
var path = require('path')
var util = require('./lib/util.js')
var analyzer = require("./lib/analyzer.js")
var cytoscape = require("./lib/cytoscape-format.js")
var vis = require("./lib/visjs-format.js")
var docEngine = require("./lib/doc-engine.js")
var inspect = require('eyes').inspector({maxLength: false})
var CfmlHandler = require("./lib/cfml-parser/cfml-handler.js")
var CfmlParser = require("./lib/cfml-parser/cfml-parser.js")
var jstoxml = require('jstoxml');

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

//analzer
  //.parseXML('./test/data.xml')
  //.then(content => console.log(content))


//docEngine.getMetadata('./components-data-3.js')
//  .then(metadata => docEngine.generateHTML(metadata))
  //.then(metadata => console.log(metadata))
  //.catch(err => console.log(err))

// searchs for any json object in depth for a given property name and value
var getObject = (obj, propName, propValue) => {
    var result = []
    
    // iterate arrays
    if(obj instanceof Array) {
        for(var i = 0; i < obj.length; i++) {
            result = result.concat(getObject(obj[i], propName, propValue))
        }
    }
    else
    {
        // iterate object properties
        for(var prop in obj) {

           if(prop == propName) {
            
               if(obj[prop] == propValue) {
                  // found!                  
                  result.push(obj)
                  break;
               }
           }
           
           // continue with nested object./array iteration
           if(obj[prop] instanceof Object || obj[prop] instanceof Array) {
               result = result.concat(getObject(obj[prop], propName, propValue))
           } 
       }      
    }
    
    return result;
}

// return a json with stored procedures information from a cfml tree
var searchStoredProcedures = (cfml) => {

  var result = []
  var sps = getObject(cfml, 'name', 'cfstoredproc')
  
  for (var sp; sp = sps.pop();) {
    var item = { 
      name: sp.attribs.procedure,
      datasource: sp.attribs.datasource,
      line: sp.line,
      parameters: []
    }
    
    var params = getObject(sp, 'name', 'cfprocparam')
    
    for (var p; p = params.pop();) {
          item.parameters.push(p.attribs.dbvarname)
    }    
    result.push(item)
  }
  
   return result
}


var processFile = (dir, file) => {
  
  return new Promise((resolve, reject) => {
  
    // process only cfm and cfc files
    if (!file.endsWith('cfm') && !file.endsWith('cfc'))
      resolve(null)
      
    util.readFileContent(file)
      .then(content => {
        
        var filename = file
        var rawHtml = content
        var handler = new CfmlHandler()
        var parser = new CfmlParser(handler)
        
        parser.writeLine(rawHtml)
        parser.done()
        
        //console.log("SP: %j",sp)
        //var cfmlTree = JSON.stringify(handler.dom)
        var cfmlTree = handler.dom
        var sps = searchStoredProcedures(cfmlTree)
    
        resolve({file: file, sps: sps})
      })
  })

}

var processDirectory = (dirName) => {

  // analyze source code
  //return new Promise((resolve, reject) => {

    // validate path
    fs.exists(dirName, (exists) => {
      if (!exists)
        console.log('directory ' + dirName + ' do not exists!')
      else {
        
        // initialize analysis result
        
        // read all files
        util.readdirPromise(dirName)
          .then(files => Promise.all(files.map(file => processFile(path.normalize(dirName), file))))
          .then(data => {
            
            //console.log("SPS: %j", sps[0])
                      //  return
                      
            // append File   
            var fileStream = fs.createWriteStream('bip' + '.csv', {
              flags: 'w' // 'a' means appending (old data will be preserved)
            })
        
            // write column names
            fileStream.write('filename, sp_name, parameter, datasource, line \n')
        
            
            data.forEach((file) => {
              
              if (file) {
                
                // for each stored procedure
                file.sps.forEach((sp) =>
                {
                  if (sp) {
                    
                    // for each parameter
                    sp.parameters.forEach((param) =>
                    {

                      fileStream.write(file.file + ', ' + sp.name + ', ' + param + ', ' + sp.datasource + ', ' + sp.line  + '\n')
                    })
                  }
                })
              }
            })
            
            //console.log("File: %j", sps)
            
            //util.save(JSON.stringify(sps), 'testeze.xml')
            //console.log("File: %j", handler.dom)


            //result.files = data
            //resolve(result)
          })
      }
  //  })
  })
}

processDirectory('./test/scan/bip')
