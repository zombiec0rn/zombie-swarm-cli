'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var prettyjson = require('prettyjson');
var request = require('request');
var utils = require('../utils');
var config = require('../config');

var cmd = {
  name: 'plan',
  usage: 'Usage: zombie-swarm plan [OPTIONS]\n\nCreate a plan for zombie placement.\n\nOPTIONS\n',
  options: utils.defaultOptions.concat([{
    name: 'file',
    default: './zombie-swarm.yml',
    help: 'Path to zombie-swarm file (default ./zombie-swarm.yml)'
  }]),
  command: function command(args) {
    utils.initCmd(args);
    utils.validateArgs(args);
    var swarmstat = config.readConfigFile(args);
    console.log('Looking for swarm nodes on ' + args.interface + '...');
    utils.querySwarmNodes(function (err, nodes) {
      if (err) throw err;
      var plan = config.createPlan(swarmstat, nodes);
      console.log(plan);
      process.exit();
    }, args, 5000);
  }
};

exports.default = cmd;