import request    from 'request'
import makePlan   from '../plan'
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
    let swarm = utils.readSwarmConfig(args.file) 
    utils.validateServices(swarm.services)
    utils.querySwarmNodes((err, nodes) => {
      if (err) throw err
      let plan = makePlan(nodes, swarm.services)
      console.log(plan)
      process.exit()
    }, args, 5000) 
  }
}

export { cmd as default }
