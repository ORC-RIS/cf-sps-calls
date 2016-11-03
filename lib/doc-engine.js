"use strict"
var util = require('./util.js')
var fs = require('fs')
var md = require('markdown-utils')
var StringBuilder = require('stringbuilder')
var handlebars = require('handlebars')
StringBuilder.extend('string')

// promise config
var Promise = require("bluebird")
Promise.onPossiblyUnhandledRejection(error => {
  throw error
})

// module functions
var getMetadata = (url) => {

  // get components metadata in json format from coldfusion server
  return new Promise((resolve, reject) => {

    //filePath
    util.readFileContent(url)
      .then(content => JSON.parse(content))
      //.then(content => util.save(content, 'eze01.js'))
      .then(content => util.capitalizeKeys(content))
      //.then(content => util.save(content, 'eze02.js'))
      //.then(content => {


        //console.log(content)
/*
        content.components.forEach(component => {
        //  console.log(component)
        })
*/

        //return content
      //})
      .then(content => resolve({ metadata: content }))
      .catch(err => console.log(err))
  })
}

var generateMD = (jsonMetadata) => {

  // analyze json metadata
  return new Promise((resolve, reject) => {

    // iterates components
    jsonMetadata.metadata.Components.forEach((component) => {

      var mdContent = new StringBuilder()

//blockquote

      mdContent.appendLine(md.h1(component.Displayname))

      mdContent.appendLine("")
      mdContent.appendLine(md.h6(component.Hint))

      // summary
      mdContent.appendLine("")
      mdContent.appendLine(md.h2("Summary"))

      // iterates each function and displays function signature and description
      component.Functions.forEach(func => {
        mdContent.appendLine("")

        var name = func.Name
        var params = func.Parameters.map(p => p.Name).join(", ")
        var signature = name + "(" + params + ")"
        mdContent.appendLine(md.h4(signature))

        if (func.Hint) {
          mdContent.appendLine("")
          mdContent.appendLine(func.Hint)
        }
      })

      // functions details
      mdContent.appendLine("")
      mdContent.appendLine(md.h2("Functions"))

      mdContent.appendLine("")
      mdContent.appendLine(JSON.stringify(component))

      // iterates functions and displays parameters details
      component.Functions.forEach(func => {
        mdContent.appendLine("")

        var name = func.Name
        var params = func.Parameters.map(p => p.Name).join(", ")
        var signature = name + "(" + params + ")"
        mdContent.appendLine(md.h4(signature))

        if (func.Hint) {
          mdContent.appendLine("")
          mdContent.appendLine(func.Hint)
        }
      })

      //console.log(component)

      // creates 1 file per component
      mdContent.build((err, result) => {
        util.save(result, './docs/md/' + component.Name + '.md')
      })

      //util.save(component, './docs/md/hola.js')

    })

    // validate path
    //resolve(jsonMetadata)
    resolve('ok')
  })
}

var generateHTMLPage = (component, templateFunc) => {
  return new Promise((resolve, reject) => {
console.log(component)
    // generate html
    var html = templateFunc(component)

    // save to file
    util.save(html, './docs/html/' + component.name + '.html')
      .then(() => resolve())

  })
}

var generateHTML = (jsonMetadata) => {

  // analyze json metadata
  return new Promise((resolve, reject) => {

    ///Users/eze1981/Code/cf-code-metrics/
    //templates/like-elixir-doc/component.html

    // read source component template definition
    util.readFileContent("./templates/like-elixir-doc/component.html")
      .then(source => handlebars.compile(source))
      .then(template => Promise.all(jsonMetadata.metadata.components.map(component => generateHTMLPage(component, template))))
      .then(() => resolve('ok2'))

  })
}

// exports
module.exports.generateMD = generateMD;
module.exports.getMetadata = getMetadata;
module.exports.generateHTML = generateHTML;
module.exports.generateHTMLPage = generateHTMLPage;
