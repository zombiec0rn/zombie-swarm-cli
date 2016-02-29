let prettyjson = require('prettyjson')
let request = require('request')
let utils = require('../utils')

let cmd = {
  name: 'ls',
  usage: 'Usage: zombie-swarm ls [OPTIONS]',
  options: [{
    name: 'verbose',
    abbr: 'v',
    help: 'Verbose (output all the node info)'
  }],
  command: function(args) {
    utils.initCmd(args)    
    console.log('Looking for swarm nodes...')
    utils.querySwarmNodes((err, nodes) => {
      if (err) throw err
      console.log(prettyjson.render(nodes))
      process.exit()
    }, args, 5000) 
  }
}

export { cmd as default }
