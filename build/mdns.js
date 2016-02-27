'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (args) {
  var ip = (0, _networkAddress2.default)(args.interface);
  var mdns = (0, _multicastDns2.default)({
    interface: ip
  });
  return mdns;
};

exports.onResponse = onResponse;
exports.query = query;

var _multicastDns = require('multicast-dns');

var _multicastDns2 = _interopRequireDefault(_multicastDns);

var _networkAddress = require('network-address');

var _networkAddress2 = _interopRequireDefault(_networkAddress);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function onResponse(mdns, callback, timer) {
  var answers = [];
  mdns.on('response', function (res) {
    var swarmAnswers = res.answers.reduce(function (found, answer) {
      if (answer.name.endsWith('zombie-swarm')) found = res.answers;
      return found;
    }, null);
    if (swarmAnswers) answers = answers.concat(swarmAnswers);
  });
  setTimeout(function () {
    callback(answers);
  }, timer);
}

function query(mdns) {
  mdns.query({
    questions: [{
      name: 'zombie-swarm',
      type: 'A'
    }]
  });
}