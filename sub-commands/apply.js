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
    }
  ],
  command: function(args) {
    let plan = JSON.parse(fs.readFileSync(args.plan))
    let report = applyPlan(plan) 
    console.log(report)
  }
}

export { cmd as default }
