#!/usr/bin/env node
let route = require('./route')
let utils = require('./utils')

require('subcmd')({
    name : 'zombie-swarm',
    usage : `Usage: zombie-swarm [COMMAND] [OPTIONS]

COMMAND(s)

  ls - list swarm nodes

OPTIONS
`,
    options : [].concat(utils.defaultOptions),
    command : function(args, cliclopts) {
      console.log(cliclopts.usage())
    },
    commands : [
      require('./sub-commands/ls').default
    ]
},{
    autoHelp : true
})(process.argv.slice(2))
