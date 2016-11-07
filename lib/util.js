"use strict"
var fs = require('fs')
var path = require('path')
var mkpath = require('mkpath')
var renameKeys = require('deep-rename-keys')
var recursive = require('recursive-readdir')

// promise config to throw errors
var Promise = require("bluebird")
Promise.onPossiblyUnhandledRejection(error => {
  throw error
})

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

var readFileContent = (filePath) => {
  return new Promise((resolve, reject) => {

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(data)
      }
    })
  })
}

var capitalizeKeys = (obj) => {
  var output = {}

  var output = renameKeys(obj, key => {
    //var newKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
    var newKey = key.toLowerCase()
    return newKey
  })

  return output
}

var save = (data, fileName) => {
  return new Promise((resolve, reject) => {

    //create directory if do not exists
    //mkpath

    fs.writeFile(fileName, data, function(err) {
      if(err) {
          reject(err)
      }
      resolve(data)
    })
  })
}

// exports
module.exports.readFileContent = readFileContent;
module.exports.capitalizeKeys = capitalizeKeys;
module.exports.save = save;
module.exports.readdirPromise = readdirPromise;
