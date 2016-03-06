import Table from 'cli-table'
import assign from 'object.assign'
let prettyjson = require('prettyjson')
let request = require('request')
let Ora = require('ora')
let utils = require('../utils')

let cmd = {
  name: 'ls',
  usage: `Usage: zombie-swarm ls [OPTIONS]

List swarm nodes.

OPTIONS
`,
  options: utils.defaultOptions.concat([{
  }]),
  command: function(args) {
    utils.initCmd(args)
    utils.validateArgs(args)
    const spinner = new Ora({ text: `Looking for swarm nodes on ${args.interface}...` })
    spinner.start()
    utils.querySwarmNodes((err, nodes) => {
      spinner.stop()
      if (err) return console.error(err)
      if (nodes.length == 0) return console.log(`No swarm nodes found on ${args.interface} ¯\_(ツ)_/¯`) 
      console.log(makeTable(nodes, args).toString())
      process.exit()
    }, args, 5000) 
  }
}

function makeTable(nodes, args) {
  let formatted = nodes.map((node) => {
    return {
      node: node.hostname,
      swarm: node.swarm, 
      tags: node.tags.join(','),
      ip: node.ip,
      engines: node.engines.join(','),
      memory: node.memory,
      cpus: `${node.cpus.length} x ${node.cpus[0].speed}`
    }
  })

  let table = new Table({
    head: Object.keys(formatted[0]).map(h => h.green),
    chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
          , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
          , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
          , 'right': '' , 'right-mid': '' , 'middle': ' ' },
    style: { 'padding-left': 0, 'padding-right': 0 }
  })
  formatted.forEach(f => { table.push(Object.values(f)) })
  return table
}

export { cmd as default }
