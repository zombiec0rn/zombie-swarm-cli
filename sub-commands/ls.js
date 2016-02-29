let prettyjson = require('prettyjson')
let request = require('request')
let utils = require('../utils')

let cmd = {
  name: 'ls',
  usage: 'Usage: zombie-swarm ls [OPTIONS]',
  options: utils.defaultOptions.concat([{
    name: 'verbose',
    abbr: 'v',
    help: 'Verbose (output all the node info)'
  }]),
  command: function(args) {
    utils.initCmd(args)
    utils.validateArgs(args)
    console.log(`Looking for swarm nodes on ${args.interface}...`)
    utils.querySwarmNodes((err, nodes) => {
      if (err) throw err
      console.log(prettyjson.render(nodes))
      process.exit()
    }, args, 5000) 
  }
}

export { cmd as default }
