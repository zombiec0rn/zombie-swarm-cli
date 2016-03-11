'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cmd = {
  name: 'plan',
  usage: 'Usage: zombie-swarm plan [OPTIONS]\n\nCreate a plan for zombie placement.\n\nOPTIONS\n',
  options: _utils2.default.defaultOptions.concat([{
    name: 'file',
    default: './zombie-swarm.yml',
    help: 'Path to zombie-swarm file (default ./zombie-swarm.yml)'
  }]),
  command: function command(args) {
    _utils2.default.initCmd(args);
    _utils2.default.validateArgs(args);
    var swarmstat = _utils2.default.readConfigFile(args);
    console.log('Looking for swarm nodes on ' + args.interface + '...');
    _utils2.default.querySwarmNodes(function (err, nodes) {
      if (err) throw err;
      var plan = config.createPlan(swarmstat, nodes);
      console.log(plan);
      process.exit();
    }, args, 5000);
  }
};

exports.default = cmd;