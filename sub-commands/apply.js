import fs         from 'fs'
import request    from 'request'
import applyPlan  from '../apply'
import * as utils from '../utils'

let cmd = {
  name: 'apply',
  usage: `Usage: zombie-swarm apply [OPTIONS]

Apply a zombie plan.

OPTIONS
`,
  options: [
    {
      name: 'plan',
      default: './zombie-swarm.zplan',
      help: 'Path to zombie plan file (default ./zombie-swarm.zplan)'
    },
    {
      name: 'always-remove',
      help: 'Add a remove command for all services being added'
    }
  ],
  command: function(args) {
    utils.assignZombieRC(args)
    let plan = JSON.parse(fs.readFileSync(args.plan))
    let report = applyPlan(plan, args) 
    console.log(report.join('\n'))
  }
}

export { cmd as default }
