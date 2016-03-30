import fs      from 'fs'
import Table   from 'cli-table'
import assign  from 'object.assign'
import values  from 'object.values'
import request from 'request'
import * as utils from '../utils'
require('colors')

let cmd = {
  name: 'services',
  usage: `Usage: zombie-swarm services [OPTIONS]

List swarm services.

OPTIONS
`,
  options: utils.defaultOptions.concat([
    {
      name: 'query',
      default: 1000,
      help: 'How long to query (ms)'
    }
  ]),
  command: function(args) {
    utils.assignZombieRC(args)
    utils.initCmd(args)
    utils.validateArgs(args)
    utils.querySwarmNodes((nodes) => {
      let services = nodes.map(utils.extractServices)
      services = [].concat.apply([], services) // flatten
      let table = makeTable(services, args)
      console.log(table.toString())
      process.exit()
    }, args, args.query) 
  }
}

function makeTable(services, args) {
  let formatted = services.map((service) => {
    return {
      id: service.id,
      image: service.image,
      node: service.host.hostname, 
      fingerprint: service.fingerprint
    }
  })

  let table = new Table({
    head: Object.keys(formatted[0]).map(h => h.cyan),
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
