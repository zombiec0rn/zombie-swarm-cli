'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultOptions = undefined;
exports.initCmd = initCmd;
exports.assignZombieRC = assignZombieRC;
exports.validateArgs = validateArgs;
exports.readSwarmConfigRaw = readSwarmConfigRaw;
exports.formatSwarmConfig = formatSwarmConfig;
exports.readSwarmConfig = readSwarmConfig;
exports.validateServices = validateServices;
exports.readNodesConfig = readNodesConfig;
exports.validateNodes = validateNodes;
exports.querySwarmNodes = querySwarmNodes;
exports.detectDuplicateFingerprints = detectDuplicateFingerprints;
exports.extractFingerprint = extractFingerprint;
exports.extractServices = extractServices;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _object = require('object.assign');

var _object2 = _interopRequireDefault(_object);

var _zombieServiceFormat = require('@zombiec0rn/zombie-service-format');

var _zombieServiceFormat2 = _interopRequireDefault(_zombieServiceFormat);

var _zombieNodeFormat = require('@zombiec0rn/zombie-node-format');

var _zombieNodeFormat2 = _interopRequireDefault(_zombieNodeFormat);

var _ora = require('ora');

var _ora2 = _interopRequireDefault(_ora);

var _route = require('./route');

var route = _interopRequireWildcard(_route);

var _mdns2 = require('./mdns');

var mdns = _interopRequireWildcard(_mdns2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// NOTE:
// `initCmd` needs to be called whenever mdns is involved.
// It creates a `route` for mdns packets -> interface
// and hooks up listeners to remove this route when app exits.
function initCmd(args) {
  // Prevent app from closing immediately
  process.stdin.resume();
  // exitHandler
  function exitHandler(err) {
    route.del(args, function () {
      console.error(err);
      process.exit();
    });
  }

  // Call exitHandler on exit
  process.on('exit', exitHandler);
  process.on('SIGINT', exitHandler);
  process.on('uncaughtException', exitHandler);

  // Add route
  route.add(args);
}

function assignZombieRC(args) {
  var rc = {};
  try {
    rc = _jsYaml2.default.safeLoad(_fs2.default.readFileSync('.zombierc'));
  } catch (e) {
    if (e.code != 'ENOENT') throw e;
  }
  (0, _object2.default)(rc, args); // Overwrite passed args
  (0, _object2.default)(args, rc); // Assign non-overwritten to args
}

var defaultOptions = [{
  name: 'interface',
  help: 'Which interface to use (required)'
}];
exports.defaultOptions = defaultOptions;
function validateArgs(args) {
  if (!args.interface) {
    console.log('Missing required argument `interface`. Exiting...');
    process.exit(1);
  }
}

function readSwarmConfigRaw(path) {
  try {
    return _jsYaml2.default.safeLoad(_fs2.default.readFileSync(path));
  } catch (e) {
    throw e;
    process.exit(1);
  }
}

function formatSwarmConfig(config) {
  var defaultServiceConfig = config.services.default || {};
  config.services = Object.keys(config.services).filter(function (k) {
    return k != 'default';
  }).map(function (k) {
    var serviceConfig = config.services[k];
    serviceConfig.id = k;
    return (0, _object2.default)({}, config.services[k], defaultServiceConfig);
  });
  return config;
}

function readSwarmConfig(path) {
  var raw = readSwarmConfigRaw(path);
  var formatted = formatSwarmConfig(raw);
  return formatted;
}

function validateServices(services) {
  services.forEach(function (s) {
    // TODO: Move to scheduler.validateServices !?
    // scheduler needs to export validateServices & validateNodes ??
    if (!s.memory) throw new Error('Missing memory - ' + s.id);
    if (!s.cpu || typeof s.cpu != 'number') throw new Error('Missing cpu - ' + s.id);
  });
  return _zombieServiceFormat2.default.validate(services);
}

function readNodesConfig(path) {
  return JSON.parse(_fs2.default.readFileSync(path));
}

function validateNodes(nodes) {
  return _zombieNodeFormat2.default.validate(nodes);
}

function querySwarmNodes(callback, args, queryTime) {
  queryTime = queryTime || 5000;
  var _mdns = mdns.default(args);
  var spinner = new _ora2.default({ text: 'Looking for swarm nodes on ' + args.interface + '...' });
  spinner.start();
  mdns.onResponse(_mdns, function (answers) {
    _async2.default.map(answers, function (a, cb) {
      (0, _request2.default)('http://' + a.data + ':8901', function (err, res, body) {
        if (res.statusCode != 200) return cb(err, a);
        var info = JSON.parse(body);
        info.ip = a.data;
        cb(err, info);
      });
    }, function (err, nodes) {
      _mdns.destroy();
      spinner.stop();
      if (err) {
        console.error(err);
        process.exit(1);
      }
      if (args.swarm) {
        nodes = nodes.filter(function (n) {
          return n.swarm == args.swarm;
        });
      }
      if (nodes.length == 0) {
        console.log('No swarm nodes found on ' + args.interface + ' ¯_(ツ)_/¯');
        process.exit(0);
      }
      callback(nodes);
    });
  }, queryTime);
  mdns.query(_mdns);
}

function detectDuplicateFingerprints(services) {
  return services.filter(function (s) {
    return s.fingerprint;
  }).map(function (s) {
    return s.fingerprint;
  }).filter(function (fp, i, arr) {
    var arrIndex = arr.indexOf(fp);
    return arrIndex >= 0 && arrIndex != i;
  });
}

function extractFingerprint(service) {
  var fingerprint = undefined;
  if (service.env) {
    service.env.forEach(function (e) {
      if (e.indexOf('ZOMBIE_SWARM_FINGERPRINT') == 0) {
        fingerprint = e.split('=')[1];
      }
    });
  }
  return fingerprint;
}

function extractServices(node) {
  return (node.services || []).map(function (s) {
    s.host = node;
    s.fingerprint = extractFingerprint(s);
    return s;
  });
}