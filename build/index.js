#!/usr/bin/env node
'use strict';

var _route = require('./route');

var route = _interopRequireWildcard(_route);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

require('subcmd')({
  name: 'zombie-swarm',
  usage: 'Usage: zombie-swarm [COMMAND] [OPTIONS]\n\nCOMMAND(s)\n\n  ls - list swarm nodes\n  plan - create a plan\n  apply - apply a plan\n\nOPTIONS\n',
  options: [].concat(utils.defaultOptions),
  command: function command(args, cliclopts) {
    console.log(cliclopts.usage());
  },
  commands: [require('./sub-commands/ls').default, require('./sub-commands/plan').default, require('./sub-commands/apply').default]
}, {
  autoHelp: true
})(process.argv.slice(2));