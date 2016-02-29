#!/usr/bin/env node
let route = require('./route')
let utils = require('./utils')

require('subcmd')({
    name : 'zombie-swarm',
    usage : `Usage: zombie-swarm [COMMAND] [OPTIONS]

COMMAND(s)

  ls - list swarm nodes
  plan - create a plan
  apply - apply a plan

OPTIONS
`,
    options : [].concat(utils.defaultOptions),
    command : function(args, cliclopts) {
      console.log(cliclopts.usage())
    },
    commands : [
      require('./sub-commands/ls').default,
      require('./sub-commands/plan').default
    ]
},{
    autoHelp : true
})(process.argv.slice(2))
