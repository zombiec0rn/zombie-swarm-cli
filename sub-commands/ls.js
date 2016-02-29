let prettyjson = require('prettyjson')
let request = require('request')
let utils = require('../utils')

let cmd = {
  name: 'ls',
  usage: 'Usage: zombie-swarm ls [OPTIONS]',
  options: utils.defaultOptions.concat([{
    name: 'verbose',
    abbr: 'v',
    boolean: true,
    help: 'Verbose (output all the node info)'
  }]),
  command: function(args) {
    utils.initCmd(args)
    utils.validateArgs(args)
    console.log(`Looking for swarm nodes on ${args.interface}...`)
    utils.querySwarmNodes((err, nodes) => {
      if (err) throw err
      let formatted = nodes.map((node) => {
        if (args.verbose) return node
        return {
          node: `${node.hostname}.${node.swarm}`,
          tags: node.tags
        }
      })
      console.log(prettyjson.render(formatted))
      process.exit()
    }, args, 5000) 
  }
}

export { cmd as default }
