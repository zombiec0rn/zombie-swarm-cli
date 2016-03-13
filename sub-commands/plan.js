import fs         from 'fs'
import request    from 'request'
import makePlan   from '../plan'
import * as utils from '../utils'

let cmd = {
  name: 'plan',
  usage: `Usage: zombie-swarm plan [OPTIONS]

Create a plan for zombie placement.

OPTIONS
`,
  options: utils.defaultOptions.concat([
    {
      name: 'swarm',
      default: './zombie-swarm.yml',
      help: 'Path to zombie-swarm file (default ./zombie-swarm.yml)'
    },
    {
      name: 'nodes',
      help: 'Path to nodes.json file'
    },
    {
      name: 'query',
      default: 1000,
      help: 'How long to query (ms)'
    }
  ]),
  command: function(args) {
    utils.initCmd(args)
    utils.validateArgs(args)
    let swarm = utils.readSwarmConfig(args.swarm) 
    utils.validateServices(swarm.services)
    let nodeQuery = !args.nodes ? utils.querySwarmNodes : (callback) => {
      callback(JSON.parse(fs.readFileSync(args.nodes))) 
    }
    nodeQuery((nodes) => {
      let plan = makePlan(nodes, swarm.services)
      console.log(plan)
      process.exit()
    }, args, args.query) 
  }
}

export { cmd as default }
