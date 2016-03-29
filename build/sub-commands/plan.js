'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _plan = require('../plan');

var _plan2 = _interopRequireDefault(_plan);

var _utils = require('../utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cmd = {
  name: 'plan',
  usage: 'Usage: zombie-swarm plan [OPTIONS]\n\nCreate a plan for zombie placement.\n\nOPTIONS\n',
  options: utils.defaultOptions.concat([{
    name: 'swarm',
    default: './zombie-swarm.yml',
    help: 'Path to zombie-swarm file (default ./zombie-swarm.yml)'
  }, {
    name: 'query',
    default: 1000,
    help: 'How long to query (ms - default 1000)'
  }, {
    name: 'out-file',
    default: './zombie-swarm.zplan',
    help: 'File to save plan (default ./zombie-swarm.zplan)'
  }, {
    name: 'dry',
    default: false,
    help: 'Dry run. Displays the diff table but does not write the file'
  }, {
    name: 'nodes',
    help: 'Path to nodes.json file'
  }]),
  command: function command(args) {
    utils.assignZombieRC(args);
    var nodeQuery = undefined;
    if (args.nodes) {
      nodeQuery = function nodeQuery(callback) {
        callback(JSON.parse(_fs2.default.readFileSync(args.nodes)));
      };
    } else {
      utils.initCmd(args);
      utils.validateArgs(args);
      nodeQuery = utils.querySwarmNodes;
    }
    var swarm = utils.readSwarmConfig(args.swarm);
    nodeQuery(function (nodes) {
      var plan = (0, _plan2.default)(nodes, swarm.services);
      if (!args.dry) _fs2.default.writeFileSync(args['out-file'], JSON.stringify(plan, null, 2));
      // TODO: provide a detailed diff table
      console.log('Adding ' + plan.add.length + ', keeping ' + plan.keep.length + ' and removing ' + plan.remove.length + '.');
      if (!args.dry) console.log('Plan written to ' + args['out-file'] + '.');
      process.exit();
    }, args, args.query);
  }
};

exports.default = cmd;