#!/usr/bin/env node
import * as route from './route'
import * as utils from './utils'
import pkg        from './package.json'

require('subcmd')({
    name : 'zombie-swarm',
    usage : `Usage: zombie-swarm [COMMAND] [OPTIONS]

COMMAND(s)

  ls - list swarm nodes
  plan - create a plan
  apply - apply a plan
  services - list swarm services

OPTIONS
`,
    options : utils.defaultOptions.concat([
      {
        name: 'version',
        abbr: 'v',
        help: 'Prints version'
      }
    ]),
    command : function(args, cliclopts) {
      if (args.v) return console.log(pkg.version)
      console.log(cliclopts.usage())
    },
    commands : [
      require('./sub-commands/ls').default,
      require('./sub-commands/plan').default, 
      require('./sub-commands/apply').default,
      require('./sub-commands/services').default
    ]
},{
    autoHelp : true
})(process.argv.slice(2))

// TODO: Improve err output if no node with required tag found!
