'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _cliTable = require('cli-table');

var _cliTable2 = _interopRequireDefault(_cliTable);

var _object = require('object.assign');

var _object2 = _interopRequireDefault(_object);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var request = require('request');
var Ora = require('ora');
var utils = require('../utils');

var cmd = {
  name: 'ls',
  usage: 'Usage: zombie-swarm ls [OPTIONS]\n\nList swarm nodes.\n\nOPTIONS\n',
  options: utils.defaultOptions.concat([{
    name: 'out-file',
    help: 'File to dump the discovered swarm nodes (.json - can be used as plan input)'
  }]),
  command: function command(args) {
    utils.initCmd(args);
    utils.validateArgs(args);
    var spinner = new Ora({ text: 'Looking for swarm nodes on ' + args.interface + '...' });
    spinner.start();
    utils.querySwarmNodes(function (err, nodes) {
      spinner.stop();
      if (err) return console.error(err);
      if (nodes.length == 0) return console.log('No swarm nodes found on ' + args.interface + ' ¯_(ツ)_/¯');
      if (args['out-file']) _fs2.default.writeFileSync(args['out-file'], JSON.stringify(nodes, null, 2));
      console.log(makeTable(nodes, args).toString());
      process.exit();
    }, args, 5000);
  }
};

function makeTable(nodes, args) {
  var formatted = nodes.map(function (node) {
    return {
      node: node.hostname,
      swarm: node.swarm,
      tags: node.tags.join(','),
      ip: node.ip,
      engines: node.engines.join(','),
      memory: node.memory,
      cpus: node.cpus.length + ' x ' + node.cpus[0].speed
    };
  });

  var table = new _cliTable2.default({
    head: Object.keys(formatted[0]).map(function (h) {
      return h.green;
    }),
    chars: { 'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
      'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
      'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
      'right': '', 'right-mid': '', 'middle': ' ' },
    style: { 'padding-left': 0, 'padding-right': 0 }
  });
  formatted.forEach(function (f) {
    table.push(Object.values(f));
  });
  return table;
}

exports.default = cmd;