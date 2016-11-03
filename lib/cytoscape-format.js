/*
Given a cf-code-metrics json object, converts to cytoscape format.
*/

var formatFileToNode = (file) => {
  return new Promise((resolve, reject) => {

    var node = {
      data: {
        id: file.file
      }
    };

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

var getEdges = (result) => {
  return new Promise((resolve, reject) => {

    var result = {
      edges: []
    }

    resolve(result)
  })
}

// module functions
var format = function(result) {

  //TODO: validate parameters

  // convert data to cytoscape format
  return new Promise(function(resolve, reject) {

    var formatResult = { nodes: [], edges: []}

    var nodesPromise = getNodes(result)
    var edgesPromise = getEdges(result)

    Promise.all([nodesPromise, edgesPromise])
      .then(data => {

        formatResult.nodes = data[0].nodes
        //console.log(data)

      })
      .then(() => resolve(formatResult))

  });
}

// exports
module.exports.format = format;
