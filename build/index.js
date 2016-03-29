#!/usr/bin/env node
'use strict';

var _route = require('./route');

var route = _interopRequireWildcard(_route);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var _package = require('./package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

require('subcmd')({
  name: 'zombie-swarm',
  usage: 'Usage: zombie-swarm [COMMAND] [OPTIONS]\n\nCOMMAND(s)\n\n  ls - list swarm nodes\n  plan - create a plan\n  apply - apply a plan\n\nOPTIONS\n',
  options: utils.defaultOptions.concat([{
    name: 'version',
    abbr: 'v',
    help: 'Prints version'
  }]),
  command: function command(args, cliclopts) {
    if (args.v) return console.log(_package2.default.version);
    console.log(cliclopts.usage());
  },
  commands: [require('./sub-commands/ls').default, require('./sub-commands/plan').default, require('./sub-commands/apply').default]
}, {
  autoHelp: true
})(process.argv.slice(2));

// TODO: Version support
// TODO: Improve err output if no node with required tag found!