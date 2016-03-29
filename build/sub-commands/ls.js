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

var _object3 = require('object.values');

var _object4 = _interopRequireDefault(_object3);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _utils = require('../utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('colors');

var cmd = {
  name: 'ls',
  usage: 'Usage: zombie-swarm ls [OPTIONS]\n\nList swarm nodes.\n\nOPTIONS\n',
  options: utils.defaultOptions.concat([{
    name: 'out-file',
    help: 'File to dump the discovered swarm nodes (.json - can be used as plan input)'
  }, {
    name: 'query',
    default: 1000,
    help: 'How long to query (ms)'
  }]),
  command: function command(args) {
    utils.assignZombieRC(args);
    utils.initCmd(args);
    utils.validateArgs(args);
    utils.querySwarmNodes(function (nodes) {
      if (args['out-file']) _fs2.default.writeFileSync(args['out-file'], JSON.stringify(nodes, null, 2));
      var table = makeTable(nodes, args);
      console.log(table.toString());
      if (args['out-file']) console.log('# Wrote config to file: ' + args['out-file']);
      process.exit();
    }, args, args.query);
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
    table.push((0, _object4.default)(f));
  });
  return table;
}

exports.default = cmd;