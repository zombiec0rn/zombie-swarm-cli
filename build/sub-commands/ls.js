'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _cliTable = require('cli-table');

var _cliTable2 = _interopRequireDefault(_cliTable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var prettyjson = require('prettyjson');
var request = require('request');
var Ora = require('ora');
var utils = require('../utils');

var cmd = {
  name: 'ls',
  usage: 'Usage: zombie-swarm ls [OPTIONS]\n\nList swarm nodes.\n\nOPTIONS\n',
  options: utils.defaultOptions.concat([{
    name: 'verbose',
    abbr: 'v',
    boolean: true,
    help: 'Verbose (output all the node info)'
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
      var table = makeTable(nodes);
      console.log(table.toString());
      process.exit();
    }, args, 5000);
  }
};

function makeTable(nodes, opts) {

  var formatted = nodes.map(function (node) {
    var _formatted = {
      node: node.hostname + '.' + node.swarm,
      tags: node.tags,
      ip: node.ip
    };
    if (args.verbose) assign(_formatted, node);
    return _formatted;
  });

  var table = new _cliTable2.default({
    head: Object.keys(data[0]),
    chars: { 'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
      'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
      'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
      'right': '', 'right-mid': '', 'middle': ' ' },
    style: { 'padding-left': 0, 'padding-right': 0 },
    wordWrap: true
  });
  data.forEach(function (d) {
    table.push(Object.values(d));
  });

  return table;
}

exports.default = cmd;