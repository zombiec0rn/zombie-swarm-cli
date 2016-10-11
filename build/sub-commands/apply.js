'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _apply = require('../apply');

var _apply2 = _interopRequireDefault(_apply);

var _utils = require('../utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cmd = {
  name: 'apply',
  usage: 'Usage: zombie-swarm apply [OPTIONS]\n\nApply a zombie plan.\n\nOPTIONS\n',
  options: [{
    name: 'plan',
    default: './zombie-swarm.zplan',
    help: 'Path to zombie plan file (default ./zombie-swarm.zplan)'
  }, {
    name: 'always-remove',
    help: 'Add a remove command for all services being added'
  }],
  command: function command(args) {
    utils.assignZombieRC(args);
    var plan = JSON.parse(_fs2.default.readFileSync(args.plan));
    var report = (0, _apply2.default)(plan, args);
    console.log(report.join('\n'));
  }
};

exports.default = cmd;