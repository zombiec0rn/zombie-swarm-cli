'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readConfigFile = readConfigFile;
exports.createPlan = createPlan;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _cccfDockerInstructions = require('cccf-docker-instructions');

var _cccfDockerInstructions2 = _interopRequireDefault(_cccfDockerInstructions);

var _object = require('object.assign');

var _object2 = _interopRequireDefault(_object);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var engines = {
  docker: {
    createServicePlan: function createServicePlan(serviceName, service, _default) {
      _default = _default || {};
      var _service = {};
      (0, _object2.default)(_service, service, { id: serviceName }, _default);
      return _cccfDockerInstructions2.default.run(_service);
    }
  }
};

function readConfigFile(args) {
  try {
    return _jsYaml2.default.safeLoad(_fs2.default.readFileSync(args.file));
  } catch (e) {
    throw e;
    process.exit(1);
  }
}

function createPlan(swarm, nodes) {
  var current = getCurrent(nodes);
  var wanted = getWanted(swarm);
  var hosts = getHosts(nodes);
  var plan = scheduler.spread(hosts, wanted, current);
  return formatPlan(plan);
}