/*
Given a cf-code-metrics json object, converts to vis.js format.
*/

var formatFileToNode = (file) => {
  return new Promise((resolve, reject) => {

    var node = {
      id: file.file,
      label: file.file
    }

    resolve(node)
  })
}

var getNodes = (result) => {
  return new Promise((resolve, reject) => {

    var nodesResult = {
      nodes: []
    }

    Promise.all(result.files.map(formatFileToNode))
      .then(nodes => {
        nodesResult.nodes = nodes
        resolve(nodesResult)
      })

  })
}

var formatFileToEdge = (file) => {
  return new Promise((resolve, reject) => {

    var edges = []



    // push dependencies
    file.includes.forEach(includedFile => {

      var edge = {
        from: file.file,
        to: includedFile
      }

      edges.push(edge);
    })

    resolve(edges)
  })
}

var getEdges = (result) => {
  return new Promise((resolve, reject) => {

    var edgesResult = {
      edges: []
    }

    Promise.all(result.files.map(formatFileToEdge))
      .then(edges => {
        // flat edges (array of arrays) using a reduce function
        edgesResult.edges = edges.reduce((a, b) => a.concat(b))
        resolve(edgesResult)
      })
  })
}

// module functions
var format = function(result) {

  //TODO: validate parameters

  // convert data to vis.js format
  return new Promise(function(resolve, reject) {

    var formatResult = { nodes: [], edges: []}

    var nodesPromise = getNodes(result)
    var edgesPromise = getEdges(result)

    Promise.all([nodesPromise, edgesPromise])
      .then(data => {

        formatResult.nodes = data[0].nodes
        formatResult.edges = data[1].edges
        //console.log(data)

      })
      .then(() => resolve(formatResult))

  });
}

// exports
module.exports.format = format;
