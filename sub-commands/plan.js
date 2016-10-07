import fs         from 'fs'
import request    from 'request'
import Table      from 'cli-table'
import values     from 'object.values'
import makePlan   from '../plan'
import * as utils from '../utils'
require('colors')

let cmd = {
  name: 'plan',
  usage: `Usage: zombie-swarm plan [OPTIONS]

Create a plan for zombie placement.

OPTIONS
`,
  options: utils.defaultOptions.concat([
    {
      name: 'swarm-file',
      default: './zombie-swarm.yml',
      help: 'Path to zombie-swarm file (default ./zombie-swarm.yml)'
    },
    {
      name: 'query',
      default: 1000,
      help: 'How long to query (ms - default 1000)'
    },
    {
      name: 'out-file',
      default: './zombie-swarm.zplan',
      help: 'File to save plan (default ./zombie-swarm.zplan)'
    },
    {
      name: 'dry',
      default: false,
      help: 'Dry run. Displays the diff table but does not write the file'
    },
    {
      name: 'nodes-file',
      help: 'Path to nodes.json file'
    }
  ]),
  command: function(args) {
    utils.assignZombieRC(args)
    let nodeQuery;
    if (args['nodes-file']) {
      nodeQuery = (callback) => {
        callback(JSON.parse(fs.readFileSync(args['nodes-file']))) 
      }
    } else {
      utils.initCmd(args)
      utils.validateArgs(args)
      nodeQuery = utils.querySwarmNodes
    }
    let swarm = utils.readSwarmConfig(args['swarm-file']) 
    nodeQuery((nodes) => {
      let plan = makePlan(nodes, swarm.services)
      if (!args.dry) fs.writeFileSync(args['out-file'], JSON.stringify(plan, null, 2))
      let table = makeTable(plan, args)
      console.log(table.toString())
//      console.log(`Adding ${plan.add.length}, keeping ${plan.keep.length} and removing ${plan.remove.length}.`)
      if (!args.dry) console.log(`Plan written to ${args['out-file']}.`)
      process.exit()
    }, args, args.query) 
  }
}

function makeTable(plan, args) {
  let formatted = []
  let formatService = (service, action) => {
    let fingerprint = service.fingerprint || 'unknown'
    if (action == 'add'.cyan) {
      fingerprint = utils.extractFingerprint(service) 
    }
    if (action == 'remove'.red) {
      fingerprint = service.previousFingerprint || service.fingerprint
    }
    return {
      id: service.id,
      image: service.image,
      node: service.host.hostname,
      fingerprint: fingerprint,
      action: action
    }
  }

  plan.remove.forEach(s => {
    formatted.push(formatService(s, 'remove'.red))
  })
  plan.keep.forEach(s => {
    formatted.push(formatService(s, 'keep'.green))
  })
  plan.add.forEach(s => {
    formatted.push(formatService(s, 'add'.cyan))
  })

  let table = new Table({
    head: Object.keys(formatted[0]).map(h => h.magenta),
    chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
          , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
          , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
          , 'right': '' , 'right-mid': '' , 'middle': ' ' },
    style: { 'padding-left': 0, 'padding-right': 0 }
  })
  formatted.forEach(f => { table.push(values(f)) })
  return table
}


export { cmd as default }
