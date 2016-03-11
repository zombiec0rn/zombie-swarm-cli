import request from 'request'
import * as utils from '../utils'

let cmd = {
  name: 'plan',
  usage: `Usage: zombie-swarm plan [OPTIONS]

Create a plan for zombie placement.

OPTIONS
`,
  options: utils.defaultOptions.concat([{
    name: 'file',
    default: './zombie-swarm.yml',
    help: 'Path to zombie-swarm file (default ./zombie-swarm.yml)'
  }]),
  command: function(args) {
    utils.initCmd(args)
    utils.validateArgs(args)
    let swarmstat = utils.readConfigFile(args) 
    console.log(`Looking for swarm nodes on ${args.interface}...`)
    utils.querySwarmNodes((err, nodes) => {
      if (err) throw err
      let plan = config.createPlan(swarmstat, nodes)
      console.log(plan)
      process.exit()
    }, args, 5000) 
  }
}

export { cmd as default }
