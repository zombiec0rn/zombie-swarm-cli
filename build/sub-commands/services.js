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
  name: 'services',
  usage: 'Usage: zombie-swarm services [OPTIONS]\n\nList swarm services.\n\nOPTIONS\n',
  options: utils.defaultOptions.concat([{
    name: 'query',
    default: 1000,
    help: 'How long to query (ms)'
  }]),
  command: function command(args) {
    utils.initCmd(args);
    utils.validateArgs(args);
    utils.querySwarmNodes(function (nodes) {
      var services = nodes.map(utils.extractServices);
      services = [].concat.apply([], services); // flatten
      var table = makeTable(services, args);
      console.log(table.toString());
      process.exit();
    }, args, args.query);
  }
};

function makeTable(services, args) {
  var formatted = services.map(function (service) {
    return {
      id: service.id,
      image: service.image,
      node: service.host.hostname,
      fingerprint: service.fingerprint
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