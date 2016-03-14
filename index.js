#!/usr/bin/env node
import * as route from './route'
import * as utils from './utils'

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
      require('./sub-commands/plan').default, 
      require('./sub-commands/apply').default
    ]
},{
    autoHelp : true
})(process.argv.slice(2))

// TODO: Version support
// TODO: Improve err output if no node with required tag found!
