'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var prettyjson = require('prettyjson');
var request = require('request');
var utils = require('../utils');

var cmd = {
  name: 'ls',
  usage: 'Usage: zombie-swarm ls [OPTIONS]',
  options: utils.defaultOptions.concat([{
    name: 'verbose',
    abbr: 'v',
    boolean: true,
    help: 'Verbose (output all the node info)'
  }]),
  command: function command(args) {
    utils.initCmd(args);
    utils.validateArgs(args);
    console.log('Looking for swarm nodes on ' + args.interface + '...');
    utils.querySwarmNodes(function (err, nodes) {
      if (err) throw err;
      var formatted = nodes.map(function (node) {
        if (args.verbose) return node;
        return {
          node: node.hostname + '.' + node.swarm,
          tags: node.tags
        };
      });
      console.log(prettyjson.render(formatted));
      process.exit();
    }, args, 5000);
  }
};

exports.default = cmd;