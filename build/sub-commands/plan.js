'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _cliTable = require('cli-table');

var _cliTable2 = _interopRequireDefault(_cliTable);

var _object = require('object.values');

var _object2 = _interopRequireDefault(_object);

var _plan = require('../plan');

var _plan2 = _interopRequireDefault(_plan);

var _utils = require('../utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('colors');

var cmd = {
  name: 'plan',
  usage: 'Usage: zombie-swarm plan [OPTIONS]\n\nCreate a plan for zombie placement.\n\nOPTIONS\n',
  options: utils.defaultOptions.concat([{
    name: 'swarm-file',
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
    name: 'show-keeps',
    default: false,
    help: 'Output containers being kept in plan table'
  }, {
    name: 'nodes-file',
    help: 'Path to nodes.json file'
  }]),
  command: function command(args) {
    utils.assignZombieRC(args);
    var nodeQuery = undefined;
    if (args['nodes-file']) {
      nodeQuery = function nodeQuery(callback) {
        callback(JSON.parse(_fs2.default.readFileSync(args['nodes-file'])));
      };
    } else {
      utils.initCmd(args);
      utils.validateArgs(args);
      nodeQuery = utils.querySwarmNodes;
    }
    var swarm = utils.readSwarmConfig(args['swarm-file']);
    nodeQuery(function (nodes) {
      var plan = (0, _plan2.default)(nodes, swarm.services);
      if (!args.dry) _fs2.default.writeFileSync(args['out-file'], JSON.stringify(plan, null, 2));
      var table = makeTable(plan, args);
      console.log(table.toString());
      //      console.log(`Adding ${plan.add.length}, keeping ${plan.keep.length} and removing ${plan.remove.length}.`)
      if (!args.dry) console.log('Plan written to ' + args['out-file'] + '.');
      process.exit();
    }, args, args.query);
  }
};

function makeTable(plan, args) {
  var formatted = [];
  var formatService = function formatService(service, action) {
    var fingerprint = service.fingerprint || 'unknown';
    if (action == 'add'.cyan) {
      fingerprint = utils.extractFingerprint(service);
    }
    if (action == 'remove'.red) {
      fingerprint = service.previousFingerprint || service.fingerprint;
    }
    return {
      id: service.id,
      image: service.image,
      node: service.host.hostname,
      fingerprint: fingerprint,
      action: action
    };
  };

  plan.remove.forEach(function (s) {
    formatted.push(formatService(s, 'remove'.red));
  });
  if (args['show-keeps']) {
    plan.keep.forEach(function (s) {
      formatted.push(formatService(s, 'keep'.green));
    });
  }
  plan.add.forEach(function (s) {
    formatted.push(formatService(s, 'add'.cyan));
  });

  if (formatted.length == 0) return 'No changes required ¯_(ツ)_/¯ (' + ('keeping ' + plan.keep.length).green + ')';

  var table = new _cliTable2.default({
    head: Object.keys(formatted[0]).map(function (h) {
      return h.magenta;
    }),
    chars: { 'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
      'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
      'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
      'right': '', 'right-mid': '', 'middle': ' ' },
    style: { 'padding-left': 0, 'padding-right': 0 }
  });
  formatted.forEach(function (f) {
    table.push((0, _object2.default)(f));
  });
  return table;
}

exports.default = cmd;